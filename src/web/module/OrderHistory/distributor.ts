import { doc, getDoc, increment, setDoc } from 'firebase/firestore';
import { firebaseDb } from '../../firebase/firebase/db';

export const updateDistributorAmount = async ({
  userId,
  amount
}: {
  userId: string;
  amount: number;
}) => {
  const docRef = doc(firebaseDb, 'distributor-payment', userId);
  await setDoc(
    docRef,
    {
      amount: increment(amount)
    },
    {
      merge: true
    }
  );
};

export const fetchDistributorAmount = async (userId: string) => {
  const docRef = doc(firebaseDb, 'distributor-payment', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as {
    amount: number;
  };
};
