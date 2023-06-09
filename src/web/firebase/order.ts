import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Unsubscribe,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { Order, OrderStatus } from '../../common/types/Order';
import { post } from './fetch';
import { firebaseDb } from './firebase/db';

export interface OrderPayload {
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
    return { ...data, orderId: snapshot.id } as Order;
  }
};

export const getOrderHistoryWithRealTimeUpdate = async (
  userId: string,
  {
    onAdded,
    onChange
  }: { onAdded: (order: Order) => void; onChange: (order: Order) => void }
): Promise<{ orders: Order[]; unsubscribe: Unsubscribe }> => {
  const q = query(
    collection(firebaseDb, 'orders').withConverter(orderConverters),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onAdded(change.doc.data());
      }
      if (change.type === 'modified') {
        onChange(change.doc.data());
      }
    });
    return querySnapshot.docs.map((doc) => doc.data());
  });

  const querySnap = await getDocs(q);
  const orders = querySnap.docs.map((doc) => doc.data());
  return { orders, unsubscribe };
};

export const incomingOrderSocketUupdate = async (
  onAdded: (order: Order) => void,
  onChange: (order: Order) => void
): Promise<{ orders: Order[]; unsubscribe: Unsubscribe }> => {
  const q = query(
    collection(firebaseDb, 'orders').withConverter(orderConverters),
    where('shopDetails.shopId', '==', 'PSG'),
    orderBy('createdAt', 'desc')
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onAdded(change.doc.data());
      }
      if (change.type === 'modified') {
        onChange(change.doc.data());
      }
    });
    return querySnapshot.docs.map((doc) => doc.data());
  });

  const querySnap = await getDocs(q);
  const orders = querySnap.docs.map((doc) => doc.data());
  return { orders, unsubscribe };
};

export const updateOrderStatus = async ({
  orderId,
  orderStatus
}: {
  orderId: string;
  orderStatus: OrderStatus;
}): Promise<void> => {
  const docRef = doc(firebaseDb, 'orders', orderId);
  return setDoc(docRef, { status: orderStatus }, { merge: true });
};
