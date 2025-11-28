// Import Firebase scripts for compatibility mode (required for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyA_Ww4RZV3hMxb3vW_BpJEm_ALMF7p8dhk",
  authDomain: "medicinereminder3-99f11.firebaseapp.com",
  projectId: "medicinereminder3-99f11",
  storageBucket: "medicinereminder3-99f11.firebasestorage.app",
  messagingSenderId: "933085962446",
  appId: "1:933085962446:web:6d053bc884af6d6444709f"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Medicine Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a medicine reminder!',
    icon: '/icons/icon-192x192.png',  // Path to your 192x192 icon in /public/icons/
    badge: '/icons/icon-72x72.png',   // Path to your 72x72 badge icon
    vibrate: [200, 100, 200],
    data: payload.data || {}          // Optional: attach custom data
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event.notification);

  event.notification.close();

  // Focus or open your app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
