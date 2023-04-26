// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCajB1KkrNGpB9eiM8ph2FFOTX35T7wB60',
  authDomain: 'mingle-munch.firebaseapp.com',
  projectId: 'mingle-munch',
  storageBucket: 'mingle-munch.appspot.com',
  messagingSenderId: '291354377634',
  appId: '1:291354377634:web:5f1d53b7cda2b2fd50c6fb'
};
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
window.firebaseAuth = firebaseAuth;
export const firebaseDb = getFirestore();
export const firebaseStorage = getStorage();
const functions = getFunctions(firebaseApp);
if (location.hostname === 'localhost') {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectStorageEmulator(firebaseStorage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
// Initialize Firebase
// const analytics = getAnalytics(firebaseApp);
