/**
 * Notification Utility Functions
 */

const admin = require("firebase-admin");

/**
 * Send single notification
 * @param {string} token - FCM token
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data
 * @returns {Promise<string>} Message ID
 */
exports.sendNotification = async (token, notification, data = {}) => {
  try {
    const message = {
      notification: notification,
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      token: token,
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
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          vibrate: [200, 100, 200],
          requireInteraction: true,
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    throw error;
  }
};

/**
 * Send batch notifications
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<object>} Results with success and failure counts
 */
exports.sendBatchNotifications = async (notifications) => {
  try {
    if (notifications.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // Firebase allows max 500 messages per batch
    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < notifications.length; i += batchSize) {
      batches.push(notifications.slice(i, i + batchSize));
    }

    let totalSuccess = 0;
    let totalFailure = 0;

    for (const batch of batches) {
      const response = await admin.messaging().sendAll(batch);
      
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Log failed messages
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send notification ${idx}:`, resp.error);
          }
        });
      }
    }

    console.log(`✅ Batch complete: ${totalSuccess} success, ${totalFailure} failed`);

    return {
      successCount: totalSuccess,
      failureCount: totalFailure,
    };
  } catch (error) {
    console.error("❌ Error sending batch notifications:", error);
    throw error;
  }
};

/**
 * Send notification to multiple tokens
 * @param {Array} tokens - Array of FCM tokens
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data
 * @returns {Promise<object>} Results
 */
exports.sendMulticastNotification = async (tokens, notification, data = {}) => {
  try {
    const message = {
      notification: notification,
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      tokens: tokens,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "medicine_reminders",
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

    const response = await admin.messaging().sendMulticast(message);
    
    console.log(`✅ Multicast sent: ${response.successCount} success, ${response.failureCount} failed`);

    return response;
  } catch (error) {
    console.error("❌ Error sending multicast notification:", error);
    throw error;
  }
};