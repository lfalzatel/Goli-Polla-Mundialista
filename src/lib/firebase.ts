import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g",
  authDomain: "green-force-pwa-2025.firebaseapp.com",
  projectId: "green-force-pwa-2025",
  storageBucket: "green-force-pwa-2025.firebasestorage.app",
  messagingSenderId: "385628439914",
  appId: "1:385628439914:web:520a75554db345afe91113"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const messagingPromise = isSupported().then(supported => supported ? getMessaging(app) : null);
