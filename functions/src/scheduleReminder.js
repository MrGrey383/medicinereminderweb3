/**
 * Scheduled Functions for Medicine Reminders
 */

const admin = require("firebase-admin");
const { sendNotification, sendBatchNotifications } = require("./utils/notifications");
const { getCurrentTime, isTimeToTakeMedicine } = require("./utils/timeHelpers");

/**
 * Send scheduled medicine reminders
 * Runs every minute to check for medicines that need reminders
 */
exports.sendScheduledReminders = async (context) => {
  try {
    console.log("🔔 Checking for scheduled reminders...");

    const now = new Date();
    const currentTime = getCurrentTime(now); // Format: "HH:MM"
    console.log(`Current time: ${currentTime}`);

    // Get all medicines scheduled for this time
    const medicinesSnapshot = await admin.firestore()
      .collection("medicines")
      .where("time", "==", currentTime)
      .where("taken", "==", false)
      .get();

    if (medicinesSnapshot.empty) {
      console.log("No medicines scheduled for this time");
      return null;
    }

    console.log(`Found ${medicinesSnapshot.size} medicines to remind`);

    const notifications = [];
    const medicineUpdates = [];

    // Process each medicine
    for (const doc of medicinesSnapshot.docs) {
      const medicine = doc.data();
      const medicineId = doc.id;

      try {
        // Get user data with FCM token
        const userDoc = await admin.firestore()
          .collection("users")
          .doc(medicine.userId)
          .get();

        if (!userDoc.exists) {
          console.log(`User ${medicine.userId} not found`);
          continue;
        }

        const user = userDoc.data();

        if (!user.fcmToken) {
          console.log(`User ${medicine.userId} has no FCM token`);
          continue;
        }

        // Prepare notification
        const notification = {
          token: user.fcmToken,
          notification: {
            title: "💊 Medicine Reminder",
            body: `Time to take ${medicine.name} - ${medicine.dosage}`,
          },
          data: {
            medicineId: medicineId,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            time: medicine.time,
            type: "medicine_reminder",
            clickAction: "/",
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channelId: "medicine_reminders",
              priority: "max",
              defaultVibrateTimings: true,
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
                badge: 1,
              },
            },
          },
        };

        notifications.push(notification);

        // Log the reminder
        medicineUpdates.push(
          admin.firestore()
            .collection("notifications")
            .add({
              userId: medicine.userId,
              medicineId: medicineId,
              type: "reminder",
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              medicine: {
                name: medicine.name,
                dosage: medicine.dosage,
                time: medicine.time,
              },
            })
        );
      } catch (error) {
        console.error(`Error processing medicine ${medicineId}:`, error);
      }
    }

    // Send all notifications in batch
    if (notifications.length > 0) {
      const results = await sendBatchNotifications(notifications);
      console.log(`✅ Sent ${results.successCount} notifications successfully`);
      console.log(`❌ Failed ${results.failureCount} notifications`);

      // Log the updates
      await Promise.all(medicineUpdates);
    }

    return null;
  } catch (error) {
    console.error("Error in sendScheduledReminders:", error);
    return null;
  }
};

/**
 * Daily cleanup function
 * Resets taken status for all medicines at midnight
 */
exports.dailyCleanup = async (context) => {
  try {
    console.log("🧹 Running daily cleanup...");

    // Get all medicines
    const medicinesSnapshot = await admin.firestore()
      .collection("medicines")
      .where("taken", "==", true)
      .get();

    if (medicinesSnapshot.empty) {
      console.log("No medicines to reset");
      return null;
    }

    console.log(`Resetting ${medicinesSnapshot.size} medicines`);

    const batch = admin.firestore().batch();

    medicinesSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        taken: false,
        takenAt: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("✅ Daily cleanup completed");

    return null;
  } catch (error) {
    console.error("Error in dailyCleanup:", error);
    return null;
  }
};

/**
 * Weekly adherence report
 * Sends weekly summary to users
 */
exports.weeklyAdherenceReport = async (context) => {
  try {
    console.log("📊 Generating weekly adherence reports...");

    // Get all users
    const usersSnapshot = await admin.firestore()
      .collection("users")
      .get();

    if (usersSnapshot.empty) {
      console.log("No users found");
      return null;
    }

    const notifications = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (!user.fcmToken) continue;

      try {
        // Get user's medicines
        const medicinesSnapshot = await admin.firestore()
          .collection("medicines")
          .where("userId", "==", userId)
          .get();

        if (medicinesSnapshot.empty) continue;

        const medicines = medicinesSnapshot.docs.map(doc => doc.data());
        const totalMedicines = medicines.length;
        const takenMedicines = medicines.filter(m => m.taken).length;
        const adherenceRate = Math.round((takenMedicines / totalMedicines) * 100);

        // Prepare report notification
        let emoji = "📊";
        let message = "";

        if (adherenceRate >= 90) {
          emoji = "🌟";
          message = `Excellent work! You've taken ${adherenceRate}% of your medicines this week.`;
        } else if (adherenceRate >= 70) {
          emoji = "👍";
          message = `Good job! You've taken ${adherenceRate}% of your medicines this week.`;
        } else {
          emoji = "📈";
          message = `You've taken ${adherenceRate}% of your medicines this week. Let's do better!`;
        }

        notifications.push({
          token: user.fcmToken,
          notification: {
            title: `${emoji} Weekly Health Report`,
            body: message,
          },
          data: {
            type: "weekly_report",
            adherenceRate: adherenceRate.toString(),
            totalMedicines: totalMedicines.toString(),
            takenMedicines: takenMedicines.toString(),
          },
        });
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    if (notifications.length > 0) {
      const results = await sendBatchNotifications(notifications);
      console.log(`✅ Sent ${results.successCount} weekly reports`);
    }

    return null;
  } catch (error) {
    console.error("Error in weeklyAdherenceReport:", error);
    return null;
  }
};