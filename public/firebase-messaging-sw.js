importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
)

firebase.initializeApp({
  apiKey: 'AIzaSyBfQBfctuUiksnOIGkyf2MEEeVbdHN8dJE',
  authDomain: 'uclago-7f303.firebaseapp.com',
  projectId: 'uclago-7f303',
  storageBucket: 'uclago-7f303.firebasestorage.app',
  messagingSenderId: '479562873238',
  appId: '1:479562873238:web:ce442197790cf0fa53c5b7',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/img/uclago_logo.png',
  })
})
