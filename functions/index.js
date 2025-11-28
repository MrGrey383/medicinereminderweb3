const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
const scheduledReminders = require("./src/scheduledReminders");
const notificationTriggers = require("./src/notificationTriggers");
const userTriggers = require("./src/userTriggers");
const adminAnalytics = require("./src/adminAnalytics");

// ============================================================================
// SCHEDULED FUNCTIONS (Existing)
// ============================================================================

exports.sendScheduledReminders = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("UTC")
  .onRun(scheduledReminders.sendScheduledReminders);

exports.dailyCleanup = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(scheduledReminders.dailyCleanup);

exports.weeklyAdherenceReport = functions.pubsub
  .schedule("0 9 * * 0")
  .timeZone("UTC")
  .onRun(scheduledReminders.weeklyAdherenceReport);

// ============================================================================
// ADMIN ANALYTICS SCHEDULED FUNCTIONS
// ============================================================================

/**
 * Update system analytics daily at 1 AM UTC
 */
exports.updateSystemAnalytics = functions.pubsub
  .schedule("0 1 * * *")
  .timeZone("UTC")
  .onRun(adminAnalytics.updateSystemAnalytics);

/**
 * Update adherence distribution daily at 1:15 AM UTC
 */
exports.updateAdherenceDistribution = functions.pubsub
  .schedule("15 1 * * *")
  .timeZone("UTC")
  .onRun(adminAnalytics.updateAdherenceDistribution);

/**
 * Track user growth daily at 1:30 AM UTC
 */
exports.trackUserGrowth = functions.pubsub
  .schedule("30 1 * * *")
  .timeZone("UTC")
  .onRun(adminAnalytics.trackUserGrowth);

/**
 * Update medicine statistics daily at 1:45 AM UTC
 */
exports.updateMedicineStatistics = functions.pubsub
  .schedule("45 1 * * *")
  .timeZone("UTC")
  .onRun(adminAnalytics.updateMedicineStatistics);

/**
 * Cleanup old logs weekly on Sunday at 2 AM UTC
 */
exports.cleanupOldLogs = functions.pubsub
  .schedule("0 2 * * 0")
  .timeZone("UTC")
  .onRun(adminAnalytics.cleanupOldLogs);

// ============================================================================
// FIRESTORE TRIGGERS (Existing)
// ============================================================================

exports.onMedicineAdded = functions.firestore
  .document("medicines/{medicineId}")
  .onCreate(notificationTriggers.onMedicineAdded);

exports.onMedicineUpdated = functions.firestore
  .document("medicines/{medicineId}")
  .onUpdate(notificationTriggers.onMedicineUpdated);

exports.onMedicineDeleted = functions.firestore
  .document("medicines/{medicineId}")
  .onDelete(notificationTriggers.onMedicineDeleted);

exports.onMedicineTaken = functions.firestore
  .document("medicines/{medicineId}")
  .onUpdate(notificationTriggers.onMedicineTaken);

exports.onUserCreated = functions.firestore
  .document("users/{userId}")
  .onCreate(userTriggers.onUserCreated);

exports.onUserUpdated = functions.firestore
  .document("users/{userId}")
  .onUpdate(userTriggers.onUserUpdated);

// ============================================================================
// ADMIN ANALYTICS TRIGGERS
// ============================================================================

/**
 * Log when a new user signs up
 */
exports.onNewUserSignup = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    await adminAnalytics.logSystemEvent("user_signup", {
      userId: context.params.userId,
      role: userData.role
    });
    return null;
  });

/**
 * Log when a caregiver links with patient
 */
exports.onCaregiverLinked = functions.firestore
  .document("caregiver_links/{linkId}")
  .onCreate(async (snap, context) => {
    await adminAnalytics.logSystemEvent("caregiver_linked", {
      linkId: context.params.linkId
    });
    return null;
  });

// ============================================================================
// HTTP FUNCTIONS (Existing + New)
// ============================================================================

exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const { userId, medicineId } = req.body;

    if (!userId || !medicineId) {
      res.status(400).json({ error: "Missing userId or medicineId" });
      return;
    }

    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const medicineDoc = await admin.firestore().collection("medicines").doc(medicineId).get();

    if (!userDoc.exists || !medicineDoc.exists) {
      res.status(404).json({ error: "User or medicine not found" });
      return;
    }

    const user = userDoc.data();
    const medicine = medicineDoc.data();

    if (!user.fcmToken) {
      res.status(400).json({ error: "User has no FCM token" });
      return;
    }

    const message = {
      notification: {
        title: "💊 Test Reminder",
        body: `Time to take ${medicine.name} - ${medicine.dosage}`,
      },
      data: {
        medicineId: medicineId,
        type: "test_reminder",
      },
      token: user.fcmToken,
    };

    const response = await admin.messaging().send(message);
    
    res.status(200).json({ 
      success: true, 
      messageId: response,
      message: "Test notification sent successfully" 
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP function to manually trigger analytics update (for testing)
 */
exports.triggerAnalyticsUpdate = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    // Run all analytics updates
    await Promise.all([
      adminAnalytics.updateSystemAnalytics(),
      adminAnalytics.updateAdherenceDistribution(),
      adminAnalytics.trackUserGrowth(),
      adminAnalytics.updateMedicineStatistics()
    ]);

    res.status(200).json({ 
      success: true,
      message: "Analytics updated successfully"
    });
  } catch (error) {
    console.error("Error updating analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

exports.getUserStats = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).json({ error: "Missing userId parameter" });
      return;
    }

    const medicinesSnapshot = await admin.firestore()
      .collection("medicines")
      .where("userId", "==", userId)
      .get();

    const medicines = medicinesSnapshot.docs.map(doc => doc.data());

    const stats = {
      totalMedicines: medicines.length,
      takenToday: medicines.filter(m => m.taken).length,
      upcomingToday: medicines.filter(m => !m.taken).length,
      adherenceRate: medicines.length > 0 
        ? Math.round((medicines.filter(m => m.taken).length / medicines.length) * 100)
        : 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: error.message });
  }
});

console.log("✅ Cloud Functions deployed successfully!");