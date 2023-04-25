import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { firebaseDb } from './firebase';
import { Product } from '../../common/types/Product';

export const productConverter = {
  toFirestore(product: Product): DocumentData {
    return { ...product };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Product {
    const data = snapshot.data(options)!;
    return data as Product;
  }
};

export const getProducts = async () => {
  const q = query(
    collection(firebaseDb, 'food').withConverter(productConverter),
    where('shopId', '==', 'PSG')
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => doc.data());
};
