importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g",
  authDomain: "green-force-pwa-2025.firebaseapp.com",
  projectId: "green-force-pwa-2025",
  storageBucket: "green-force-pwa-2025.firebasestorage.app",
  messagingSenderId: "385628439914",
  appId: "1:385628439914:web:520a75554db345afe91113"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || "Goli Polla Mundialista";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes una nueva notificación.",
    icon: "/pwa-192x192.png",
    badge: "/masked-icon.svg",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
