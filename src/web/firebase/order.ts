import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  Unsubscribe,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { Order, OrderStatus } from '../../common/types/Order';
import { post } from './fetch';
import { firebaseDb } from './firebase/db';

export interface OrderPayload {
  details: { itemId: string; quantity: number }[];
  appliedCoupon: string;
  orderId?: string;
  locationId: string;
}

export const createOrder = async (
  params: OrderPayload
): Promise<Order & { paymentLink: string }> => post('/v1/order', params, true);

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

export const createHomeOrder = async (params: {
  quantity: number;
  number: number;
  timeSlot: string;
  date: Date;
}): Promise<{ success: boolean }> => post('/v1/home-order', params, true);

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
  const internalOrderQuery = query(
    collection(firebaseDb, 'internal-orders').withConverter(orderConverters),
    orderBy('createdAt', 'desc'),
    limit(25)
  );
  const orderQuery = query(
    collection(firebaseDb, 'orders').withConverter(orderConverters),
    orderBy('createdAt', 'desc'),
    limit(25)
  );

  const internalOrderData = await getDocs(internalOrderQuery);
  const internalOrder = internalOrderData.docs.map((doc) => doc.data());
  const orderData = await getDocs(orderQuery);
  const orders = orderData.docs.map((doc) => doc.data());
  const getResult = (orders: Order[]) =>
    orders.map((o) => ({
      ...o,
      bill:
        internalOrder.find((order) => order.orderId === o.orderId)?.bill ??
        o.bill,
      shopOrderValue:
        internalOrder.find((order) => order.orderId === o.orderId)
          ?.shopOrderValue ?? o.shopOrderValue
    }));
  const unsubscribe = onSnapshot(orderQuery, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onAdded(getResult([change.doc.data()])[0]);
      }
      if (change.type === 'modified') {
        onChange(getResult([change.doc.data()])[0]);
      }
    });
    return querySnapshot.docs.map((doc) => doc.data());
  });
  return { orders: getResult(orders), unsubscribe };
};

export const updateOrderStatus = async ({
  orderId,
  orderStatus,
  time,
  delayReason
}: {
  orderId: string;
  orderStatus: OrderStatus;
  time: Date;
  delayReason: string[];
}): Promise<void> => {
  const docRef = doc(firebaseDb, 'orders', orderId);
  const delay =
    delayReason.length > 0
      ? {
          delayReason: {
            [orderStatus]: delayReason
          }
        }
      : {};
  const internalDocRef = doc(firebaseDb, 'internal-orders', orderId);
  await setDoc(
    internalDocRef,
    {
      status: orderStatus,
    },
    {
      merge: true
    }
  )
  return setDoc(
    docRef,
    {
      status: orderStatus,
      timeStamps: {
        [orderStatus]: Timestamp.fromDate(time)
      },
      ...delay
    },
    { merge: true }
  );
};

export const updateCongestion = async ({
  orderId,
  congestion
}: {
  orderId: string;
  congestion: number;
}): Promise<void> => {
  const docRef = doc(firebaseDb, 'orders', orderId);
  return setDoc(
    docRef,
    {
      congestion: congestion,
      congestionReportTiming: serverTimestamp()
    },
    { merge: true }
  );
};

export const getLastOrder = async (
  userId: string,
  onChange: (order: Order) => void,
  onAdded: (order: Order) => void
): Promise<{ order: Order | null; unsubscribe: Unsubscribe }> => {
  const q = query(
    collection(firebaseDb, 'orders').withConverter(orderConverters),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const querySnap = await getDocs(q);
  const orders = querySnap.docs.map((doc) => doc.data());
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        onChange(change.doc.data());
      }
      if (change.type === 'added') {
        onAdded(change.doc.data());
      }
    });
    return querySnapshot.docs.map((doc) => doc.data());
  });
  return { order: orders[0] ?? null, unsubscribe: unsubscribe };
};
