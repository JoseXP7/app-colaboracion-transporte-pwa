import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyBfQBfctuUiksnOIGkyf2MEEeVbdHN8dJE',
  authDomain: 'uclago-7f303.firebaseapp.com',
  projectId: 'uclago-7f303',
  storageBucket: 'uclago-7f303.firebasestorage.app',
  messagingSenderId: '479562873238',
  appId: '1:479562873238:web:ce442197790cf0fa53c5b7',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const messaging = getMessaging(firebaseApp)
export { getToken }
