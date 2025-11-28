// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA_Ww4RZV3hMxb3vW_BpJEm_ALMF7p8dhk",
  authDomain: "medicinereminder3-99f11.firebaseapp.com",
  projectId: "medicinereminder3-99f11",
  storageBucket: "medicinereminder3-99f11.firebasestorage.app",
  messagingSenderId: "933085962446",
  appId: "1:933085962446:web:6d053bc884af6d6444709f",
  measurementId: "G-1N75J94N18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional analytics
export const analytics = getAnalytics(app);

// Messaging (may fail in unsupported environments)
let messaging = null;

try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Messaging not supported in this environment");
}

// Request permission + get FCM token
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission NOT granted");
      return null;
    }

    console.log("Notification permission granted");

    if (!messaging) {
      console.error("Firebase Messaging unavailable");
      return null;
    }

    const vapidKey =
      "BA8Bzv6HSYib2z1kocH1843YjVAfR5dyxpxMn4bB8f-VI0pCHjWAflOz549pCXU1cb8vfbgZI3bW4l1o-wO9QoA";

    const token = await getToken(messaging, { vapidKey });
    console.log("FCM Token:", token);

    return token;

  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback) {
  if (!messaging) return;
  onMessage(messaging, callback);
}

// Export default
export default app;
