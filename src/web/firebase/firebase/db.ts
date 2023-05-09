// import { getAnalytics } from 'firebase/analytics';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebsae-app';

export const firebaseDb = getFirestore(firebaseApp);
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
}
// Initialize Firebase
// const analytics = getAnalytics(firebaseApp);
