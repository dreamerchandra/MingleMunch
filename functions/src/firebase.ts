import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  credential: applicationDefault()
});
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
