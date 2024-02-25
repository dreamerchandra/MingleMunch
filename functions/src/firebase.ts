import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { getStorage } from 'firebase-admin/storage';

const app = initializeApp({
  credential: applicationDefault()
});
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const fcm = getMessaging(app);
export const storage = getStorage(app);