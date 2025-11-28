import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { messaging, db } from '../config/firebase';

/**
 * Notification Service
 * Handles push notifications via Firebase Cloud Messaging
 */

/**
 * Request notification permission
 * @returns {Promise<boolean>} Permission granted
 */
export const requestPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.error('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
};

/**
 * Get FCM token
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} FCM token
 */
export const getFCMToken = async (userId) => {
  try {
    if (!messaging) {
      console.error('Messaging not supported');
      return null;
    }

    const permission = await requestPermission();
    if (!permission) {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });

    if (token) {
      // Save token to Firestore
      await saveTokenToDatabase(userId, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to database
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 * @returns {Promise<void>}
 */
export const saveTokenToDatabase = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token,
      tokenUpdatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Setup foreground message listener
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const onMessageListener = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 * @returns {Notification|null}
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return null;
  }

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options
  };

  return new Notification(title, defaultOptions);
};

/**
 * Schedule local notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 * @param {number} delay - Delay in milliseconds
 * @returns {number} Timeout ID
 */
export const scheduleNotification = (title, options, delay) => {
  return setTimeout(() => {
    showNotification(title, options);
  }, delay);
};

/**
 * Cancel scheduled notification
 * @param {number} timeoutId - Timeout ID
 */
export const cancelNotification = (timeoutId) => {
  clearTimeout(timeoutId);
};

/**
 * Send medicine reminder notification
 * @param {object} medicine - Medicine data
 * @returns {Notification|null}
 */
export const sendMedicineReminder = (medicine) => {
  const title = '💊 Medicine Reminder';
  const options = {
    body: `Time to take ${medicine.name} - ${medicine.dosage}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: `medicine-${medicine.id}`,
    requireInteraction: true,
    actions: [
      { action: 'taken', title: '✅ Taken' },
      { action: 'snooze', title: '⏰ Snooze' }
    ],
    data: {
      medicineId: medicine.id,
      url: '/'
    }
  };

  return showNotification(title, options);
};

/**
 * Check notification permission status
 * @returns {string} Permission status
 */
export const getPermissionStatus = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export const areNotificationsSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export default {
  requestPermission,
  getFCMToken,
  saveTokenToDatabase,
  onMessageListener,
  showNotification,
  scheduleNotification,
  cancelNotification,
  sendMedicineReminder,
  getPermissionStatus,
  areNotificationsSupported
};