/**
 * Firestore Trigger Functions for Notifications
 */

const admin = require("firebase-admin");
const { sendNotification } = require("./utils/notifications");

/**
 * Trigger when a new medicine is added
 */
exports.onMedicineAdded = async (snap, context) => {
  try {
    const medicine = snap.data();
    const medicineId = context.params.medicineId;

    console.log(`New medicine added: ${medicine.name} for user ${medicine.userId}`);

    // Get user data
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(medicine.userId)
      .get();

    if (!userDoc.exists || !userDoc.data().fcmToken) {
      console.log("User has no FCM token");
      return null;
    }

    const user = userDoc.data();

    // Send confirmation notification
    await sendNotification(user.fcmToken, {
      title: "✅ Medicine Added",
      body: `${medicine.name} has been added to your schedule at ${medicine.time}`,
    }, {
      type: "medicine_added",
      medicineId: medicineId,
    });

    console.log("✅ Confirmation notification sent");
    return null;
  } catch (error) {
    console.error("Error in onMedicineAdded:", error);
    return null;
  }
};

/**
 * Trigger when a medicine is updated
 */
exports.onMedicineUpdated = async (change, context) => {
  try {
    const before = change.before.data();
    const after = change.after.data();
    const medicineId = context.params.medicineId;

    console.log(`Medicine updated: ${after.name}`);

    // Check if time was changed
    if (before.time !== after.time) {
      const userDoc = await admin.firestore()
        .collection("users")
        .doc(after.userId)
        .get();

      if (userDoc.exists && userDoc.data().fcmToken) {
        await sendNotification(userDoc.data().fcmToken, {
          title: "⏰ Schedule Updated",
          body: `${after.name} time changed from ${before.time} to ${after.time}`,
        }, {
          type: "medicine_updated",
          medicineId: medicineId,
        });
      }
    }

    return null;
  } catch (error) {
    console.error("Error in onMedicineUpdated:", error);
    return null;
  }
};

/**
 * Trigger when a medicine is deleted
 */
exports.onMedicineDeleted = async (snap, context) => {
  try {
    const medicine = snap.data();
    const medicineId = context.params.medicineId;

    console.log(`Medicine deleted: ${medicine.name}`);

    // Log the deletion
    await admin.firestore()
      .collection("activity_logs")
      .add({
        userId: medicine.userId,
        action: "medicine_deleted",
        medicineId: medicineId,
        medicineName: medicine.name,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    return null;
  } catch (error) {
    console.error("Error in onMedicineDeleted:", error);
    return null;
  }
};

/**
 * Trigger when a medicine is marked as taken
 */
exports.onMedicineTaken = async (change, context) => {
  try {
    const before = change.before.data();
    const after = change.after.data();
    const medicineId = context.params.medicineId;

    // Check if medicine was just marked as taken
    if (!before.taken && after.taken) {
      console.log(`Medicine taken: ${after.name}`);

      // Get user's medicines to calculate streak
      const medicinesSnapshot = await admin.firestore()
        .collection("medicines")
        .where("userId", "==", after.userId)
        .get();

      const medicines = medicinesSnapshot.docs.map(doc => doc.data());
      const takenCount = medicines.filter(m => m.taken).length;
      const totalCount = medicines.length;

      // Send encouragement if all medicines taken
      if (takenCount === totalCount && totalCount > 0) {
        const userDoc = await admin.firestore()
          .collection("users")
          .doc(after.userId)
          .get();

        if (userDoc.exists && userDoc.data().fcmToken) {
          await sendNotification(userDoc.data().fcmToken, {
            title: "🎉 All Done!",
            body: "Great job! You've taken all your medicines for today!",
          }, {
            type: "all_medicines_taken",
            adherenceRate: "100",
          });
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error in onMedicineTaken:", error);
    return null;
  }
};