import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../firebase/auth';
import { get } from '../../firebase/fetch';
import {
  QueryDocumentSnapshot,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { firebaseDb } from '../../firebase/firebase/db';

const getHerCoupon = async () => {
  const data = await get('/v1/her-coupon');
  return data as { coupon: string };
};

export const useHerCouponQuery = () => {
  const { userDetails } = useUser();
  const myId = userDetails?.user?.uid;
  return useQuery({
    queryKey: ['her-coupon'],
    queryFn: () => {
      return getHerCoupon();
    },
    enabled: !!myId
  });
};

interface HerCoupon {
  coupon: string;
  ownerId: string;
  usedBy: string[];
  invited: Record<string, Date>;
}

const herCouponConverter = {
  toFirestore(data: HerCoupon) {
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot<HerCoupon>): HerCoupon {
    const data = snapshot.data();
    return {
      coupon: snapshot.id,
      ownerId: data.ownerId,
      usedBy: data.usedBy,
      invited: data.invited
    };
  }
};

const getHerCoupons = async (myId: string) => {
  const snapshot = collection(firebaseDb, 'herCoupon').withConverter(
    herCouponConverter
  );
  const q = query(snapshot, where('ownerId', '==', myId));
  const data = await getDocs(q);
  return data.docs.map((doc) => doc.data());
};

const createHerCoupon = (couponCode: string, myId: string) => {
  const docRef = doc(
    collection(firebaseDb, 'herCoupon').withConverter(herCouponConverter),
    couponCode
  );
  return setDoc(docRef, {
    ownerId: myId,
    usedBy: [],
    invited: {},
    coupon: couponCode
  });
};

export const useHerCouponsQuery = () => {
  const { userDetails } = useUser();
  const myId = userDetails?.user?.uid;
  const isAdmin = userDetails?.role === 'admin';
  return useQuery(['her-coupons'], () => getHerCoupons(myId!), {
    enabled: isAdmin
  });
};

export const useCreateHerCoupon = () => {
  const { userDetails } = useUser();
  const myId = userDetails?.user?.uid;
  const queryClient = useQueryClient();
  return useMutation(
    (couponCode: string) => {
      return createHerCoupon(couponCode, myId!);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['her-coupons']);
      }
    }
  );
};
