import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { firebaseDb } from '../config';
import { useQuery } from '@tanstack/react-query';

export interface Shop {
  shopName: string;
  shopAddress: string;
  shopMapLocation: string;
  shopId: string;
  shopImage: string;
  description: string;
  isOpen: boolean;
  deliveryFee: number;
  minOrderValue?: number;
  minOrderDeliveryFee?: number;
  commission: number;
  carousel?: { image: string; url?: string; isPublished: boolean }[];
  tag?: string;
  orderRank: number;
}

const shopConverter = {
  toFirestore(product: Shop): DocumentData {
    return { ...product };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Shop {
    const data = snapshot.data(options);
    return { ...data, shopId: snapshot.id } as Shop;
  }
};

const getShops = async () => {
  const q = query(
    collection(firebaseDb, 'shop').withConverter(shopConverter),
    orderBy('orderRank', 'asc')
  );
  const querySnap = await getDocs(q);
  const data = querySnap.docs.map((doc) => doc.data());
  return data;
};
export const useShopQuery = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: () => getShops()
  });
};
