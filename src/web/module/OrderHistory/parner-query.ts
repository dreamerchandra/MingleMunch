import { useQuery } from '@tanstack/react-query';
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { firebaseDb } from '../../firebase/firebase/db';
import { useUser } from '../../firebase/auth';
import { fetchDistributorAmount } from './distributor';

interface Partner {
  name: string;
  userId: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'delivery' | 'distributor';
}

export const partnerConverter = {
  toFirestore(order: Partner): DocumentData {
    return order;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Partner {
    const data = snapshot.data(options);
    return data as Partner;
  }
};

const fetchPartner = async () => {
  const partnerQuery = query(
    collection(firebaseDb, 'partners').withConverter(partnerConverter),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(partnerQuery);
  return snapshot.docs.map((doc) => doc.data());
};

export const usePartnerQuery = () => {
  return useQuery(
    ['partner'],
    () => {
      return fetchPartner();
    },
    {
      staleTime: 1000 * 60 * 60 * 24
    }
  );
};

export const useDistributorPaymentQuery = () => {
  const {
    userDetails: { user, role }
  } = useUser();
  return useQuery(
    ['distributor-payment'],
    () => {
      return fetchDistributorAmount(user!.uid);
    },
    {
      enabled: role === 'distributor',
      staleTime: 1000 * 60 * 60 * 24
    }
  );
};
