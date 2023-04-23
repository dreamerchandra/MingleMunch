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
  apiKey: 'AIzaSyB2pE9u5UaUXkWKHO3_05DBvVaFqu49p1U',
  authDomain: 'tieheart-f1808.firebaseapp.com',
  projectId: 'tieheart-f1808',
  storageBucket: 'tieheart-f1808.appspot.com',
  messagingSenderId: '100203556049',
  appId: '1:100203556049:web:23f61f41d895a890dca9f0',
  measurementId: 'G-9D9D24FD7W'
};
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
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
