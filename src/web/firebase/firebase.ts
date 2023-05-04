// import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { firebaseApp } from './firebsae-app';

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp);
if (location.hostname === 'localhost') {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectStorageEmulator(firebaseStorage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
// Initialize Firebase
// const analytics = getAnalytics(firebaseApp);
