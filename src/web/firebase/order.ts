import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { Order } from '../../common/types/Order';
import { post } from './fetch';
import { firebaseDb } from './firebase';

interface OrderPayload {
  details: { itemId: string; quantity: number }[];
}

export const createOrder = async (
  params: OrderPayload
): Promise<Order & { paymentLink: string }> => post('/v1/order', params);

export const orderConverters = {
  toFirestore(order: Order): DocumentData {
    return order;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Order {
    const data = snapshot.data(options);
    return data as Order;
  }
};

export const getOrderHistory = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(firebaseDb, 'orders').withConverter(orderConverters),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => doc.data());
};
