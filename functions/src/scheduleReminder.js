/**
 * Scheduled Functions for Medicine Reminders
 * Now includes email notifications via SendGrid
 */

const admin = require("firebase-admin");
const { sendNotification, sendBatchNotifications } = require("./utils/notifications");
const { getCurrentTime, isTimeToTakeMedicine } = require("./utils/timeHelpers");
const { 
  sendMedicineReminderEmail, 
  sendDailySummaryEmail,
  sendWeeklyReportEmail 
} = require("./utils/emailService");

/**
 * Send scheduled medicine reminders
 * Runs every minute to check for medicines that need reminders
 * Now sends BOTH push notifications AND emails (if user has email enabled)
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
    const emailPromises = [];

    // Process each medicine
    for (const doc of medicinesSnapshot.docs) {
      const medicine = doc.data();
      const medicineId = doc.id;

      try {
        // Get user data with FCM token and email preferences
        const userDoc = await admin.firestore()
          .collection("users")
          .doc(medicine.userId)
          .get();

        if (!userDoc.exists) {
          console.log(`User ${medicine.userId} not found`);
          continue;
        }

        const user = userDoc.data();

        // Send push notification if user has FCM token
        if (user.fcmToken) {
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
        }

        // Send email if user has email reminders enabled
        if (user.emailReminders && user.email) {
          console.log(`📧 Sending email reminder to ${user.email}`);
          emailPromises.push(
            sendMedicineReminderEmail(user.email, medicine)
              .catch(err => console.error(`Failed to send email to ${user.email}:`, err))
          );
        }

        // Log the reminder
        medicineUpdates.push(
          admin.firestore()
            .collection("notifications")
            .add({
              userId: medicine.userId,
              medicineId: medicineId,
              type: "reminder",
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              channels: {
                push: !!user.fcmToken,
                email: !!(user.emailReminders && user.email)
              },
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

    // Send all push notifications in batch
    if (notifications.length > 0) {
      const results = await sendBatchNotifications(notifications);
      console.log(`✅ Sent ${results.successCount} push notifications successfully`);
      console.log(`❌ Failed ${results.failureCount} push notifications`);
    }

    // Send all emails
    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
      console.log(`📧 Processed ${emailPromises.length} email reminders`);
    }

    // Log the updates
    await Promise.all(medicineUpdates);

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
 * Send daily summary email to users
 * Runs at 8 AM every day
 */
exports.dailySummaryEmail = async (context) => {
  try {
    console.log("📊 Sending daily summary emails...");

    // Get all users who have email reminders enabled
    const usersSnapshot = await admin.firestore()
      .collection("users")
      .where("emailReminders", "==", true)
      .get();

    if (usersSnapshot.empty) {
      console.log("No users with email reminders enabled");
      return null;
    }

    console.log(`Found ${usersSnapshot.size} users to send summaries`);

    const emailPromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (!user.email) continue;

      try {
        // Get user's medicines for today
        const medicinesSnapshot = await admin.firestore()
          .collection("medicines")
          .where("userId", "==", userId)
          .get();

        if (medicinesSnapshot.empty) continue;

        const medicines = medicinesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Send daily summary email
        emailPromises.push(
          sendDailySummaryEmail(user.email, user.name || "User", medicines)
            .catch(err => console.error(`Failed to send summary to ${user.email}:`, err))
        );
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
      console.log(`✅ Sent ${emailPromises.length} daily summaries`);
    }

    return null;
  } catch (error) {
    console.error("Error in dailySummaryEmail:", error);
    return null;
  }
};

/**
 * Weekly adherence report
 * Sends weekly summary to users via push AND email
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
    const emailPromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

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

        // Prepare message
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

        // Send push notification if user has FCM token
        if (user.fcmToken) {
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
        }

        // Send email if user has email reminders enabled
        if (user.emailReminders && user.email) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          
          const stats = {
            adherenceRate,
            totalMedicines,
            takenMedicines,
            weekStart: weekStart.toLocaleDateString(),
            weekEnd: new Date().toLocaleDateString()
          };

          emailPromises.push(
            sendWeeklyReportEmail(user.email, user.name || 'User', stats)
              .catch(err => console.error(`Failed to send weekly report to ${user.email}:`, err))
          );
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    // Send push notifications
    if (notifications.length > 0) {
      const results = await sendBatchNotifications(notifications);
      console.log(`✅ Sent ${results.successCount} weekly reports via push`);
    }

    // Send emails
    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
      console.log(`📧 Sent ${emailPromises.length} weekly reports via email`);
    }

    return null;
  } catch (error) {
    console.error("Error in weeklyAdherenceReport:", error);
    return null;
  }
};