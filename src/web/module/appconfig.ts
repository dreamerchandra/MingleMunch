import { useQuery } from '@tanstack/react-query';
import {
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc
} from 'firebase/firestore';
import { firebaseDb } from '../firebase/firebase/db';
import { useUser } from '../firebase/auth';

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

interface UserConfig {
  availableCoupons?: string[];
  myReferralCodes: string;
}

const userConverter = {
  toFirestore(data: UserConfig) {
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot<UserConfig>): UserConfig {
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

export const useUserConfig = () => {
  const { userDetails } = useUser();

  return useQuery({
    queryKey: ['userConfig'],
    queryFn: async () => {
      console.log(userDetails.user?.uid)
      const snap = await getDoc(
        doc(
          collection(firebaseDb, 'users').withConverter(userConverter),
          userDetails.user?.uid
        )
      );
      const data = snap.data();
      return data || {
        availableCoupons: [],
        myReferralCodes: ''
      };
    },
    enabled: !!userDetails.user?.uid
  });
};
