import { useQuery } from '@tanstack/react-query';
import {
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc
} from 'firebase/firestore';
import { firebaseDb } from '../firebase/firebase/db';

interface AppConfig {
  isOpen: true;
  platformFee: number;
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

export const useAppConfig = () => {
  return useQuery({
    queryKey: ['appConfig'],
    queryFn: async () => {
      const snap = await getDoc(
        doc(
          collection(firebaseDb, 'appConfig').withConverter(appConfigConverter),
          'public'
        )
      );
      return snap.data();
    }
  });
};
