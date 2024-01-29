import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { firebaseDb } from '../firebase.js';

export interface AppConfig {
  platformFee: number;
  isOpen: true;
}

const appConfigConverter = {
  toFirestore(data: AppConfig) {
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot<AppConfig>): AppConfig {
    const data = snapshot.data();
    return data;
  }
};

export const getConfig = async () => {
  logger.log('fetching app config');
  const ref = firebaseDb.collection('appConfig').doc('public').withConverter(appConfigConverter);
  const snap = await ref.get();
  return snap.data()!;
};
