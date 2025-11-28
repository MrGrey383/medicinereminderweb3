import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook for notifications
 * @param {string} userId - User ID
 * @returns {object} Notification state and methods
 */
export const useNotifications = (userId) => {
  const [permission, setPermission] = useState('default');
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    checkPermission();
    setupForegroundListener();
  }, []);

  /**
   * Check notification permission
   */
  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  /**
   * Request notification permission
   */
  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await getMessagingToken();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Get FCM token
   */
  const getMessagingToken = async () => {
    try {
      if (!messaging) {
        throw new Error('Messaging not supported');
      }

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });

      if (currentToken) {
        setToken(currentToken);
        
        // Save token to Firestore
        if (userId) {
          await saveTokenToDatabase(currentToken);
        }

        return currentToken;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (err) {
      console.error('Error getting token:', err);
      setError(err.message);
      return null;
    }
  };

  /**
   * Save FCM token to database
   */
  const saveTokenToDatabase = async (fcmToken) => {
    try {
      await setDoc(
        doc(db, 'users', userId),
        { fcmToken, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving token:', err);
    }
  };

  /**
   * Setup foreground message listener
   */
  const setupForegroundListener = () => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      setCurrentNotification({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data
      });

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Notification', {
          body: payload.notification?.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200]
        });
      }
    });
  };

  /**
   * Show local notification
   */
  const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  };

  /**
   * Clear current notification
   */
  const clearNotification = () => {
    setCurrentNotification(null);
  };

  return {
    permission,
    token,
    error,
    currentNotification,
    requestPermission,
    getMessagingToken,
    showNotification,
    clearNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default'
  };
};

export default useNotifications;