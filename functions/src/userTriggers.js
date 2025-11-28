/**
 * Firestore Trigger Functions for User Events
 */

const admin = require("firebase-admin");
const { sendNotification } = require("./utils/notifications");

/**
 * Trigger when a new user is created
 */
exports.onUserCreated = async (snap, context) => {
  try {
    const user = snap.data();
    const userId = context.params.userId;

    console.log(`New user created: ${user.email}`);

    // Initialize user statistics
    await admin.firestore()
      .collection("user_stats")
      .doc(userId)
      .set({
        totalMedicines: 0,
        totalTaken: 0,
        currentStreak: 0,
        longestStreak: 0,
        adherenceHistory: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Send welcome notification if FCM token exists
    if (user.fcmToken) {
      await sendNotification(user.fcmToken, {
        title: "👋 Welcome to Medicine Reminder!",
        body: "Start by adding your first medicine to never miss a dose again.",
      }, {
        type: "welcome",
        userId: userId,
      });

      console.log("✅ Welcome notification sent");
    }

    return null;
  } catch (error) {
    console.error("Error in onUserCreated:", error);
    return null;
  }
};

/**
 * Trigger when user profile is updated
 */
exports.onUserUpdated = async (change, context) => {
  try {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    console.log(`User updated: ${after.email}`);

    // Check if FCM token was added/changed
    if (before.fcmToken !== after.fcmToken && after.fcmToken) {
      console.log(`FCM token updated for user ${userId}`);
      
      // Send test notification
      await sendNotification(after.fcmToken, {
        title: "🔔 Notifications Enabled",
        body: "You'll now receive reminders for your medicines!",
      }, {
        type: "notifications_enabled",
        userId: userId,
      });
    }

    return null;
  } catch (error) {
    console.error("Error in onUserUpdated:", error);
    return null;
  }
};