import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  query
} from 'firebase/firestore';
import { Shop } from '../../common/types/shop';
import { firebaseDb } from './firebase/db';

export const shopConverter = {
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

export const getShops = async () => {
  const q = query(collection(firebaseDb, 'shop').withConverter(shopConverter));
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => doc.data());
};
