import { initializeApp } from 'firebase/app';
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const isLocal = window.location.hostname === 'localhost';
const firebaseConfig = {
  apiKey: 'AIzaSyCajB1KkrNGpB9eiM8ph2FFOTX35T7wB60',
  authDomain: 'mingle-munch.firebaseapp.com',
  projectId: 'mingle-munch',
  storageBucket: 'mingle-munch.appspot.com',
  messagingSenderId: '291354377634',
  appId: '1:291354377634:web:5f1d53b7cda2b2fd50c6fb',
  measurementId: !isLocal ? 'G-S2H7D2Z5LC' : ''
};
export const firebaseApp = initializeApp(firebaseConfig);

initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(
    isLocal
      ? 'BA0C97DA-1540-4109-B786-883273B68DEB'
      : '6Lc1NWYpAAAAANsYxxYzJBdptMY9_Lyl7Plhg5Jx'
  ),
  isTokenAutoRefreshEnabled: true
});

export default firebaseApp;
export const firebaseDb = getFirestore(firebaseApp);
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
}


export const firebaseAuth = getAuth(firebaseApp);
if (location.hostname === 'localhost') {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099', {
    disableWarnings: true
  });
}
