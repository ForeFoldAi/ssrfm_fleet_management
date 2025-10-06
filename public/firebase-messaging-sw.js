importScripts(
  'https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js'
);

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyDUsLPkTSFrszbrN4lrBQbYFQFvlixdU1Y',
  authDomain: 'ssfrm-c07ac.firebaseapp.com',
  projectId: 'ssfrm-c07ac',
  storageBucket: 'ssfrm-c07ac.firebasestorage.app',
  messagingSenderId: '1039770001785',
  appId: '1:1039770001785:web:8294ccae401525d93dcfa8',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = { body: payload.notification.body };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
