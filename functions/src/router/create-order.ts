import { Request } from 'express';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firebaseDb } from '../firebase.js';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
import { OrderDb } from './order-helper.js';
type PublicOrder = Omit<OrderDb, 'items' | 'shopOrderValue' | 'bill'> & {
  shopOrderValue?: never;
  items: Omit<Product, 'costPrice' | 'costParcelCharges'> &
    {
      costPrice: never;
      costParcelCharges: never;
    }[];
  bill: Omit<OrderDb['bill'], 'costPriceSubTotal'> & {
    costPriceSubTotal: never;
  };
};

export const publicOrderConverter = {
  toFirestore: (order: OrderDb) => {
    const result: PublicOrder = JSON.parse(JSON.stringify(order));
    result.items.forEach((item) => {
      delete item.costParcelCharges;
      delete item.costPrice;
    });
    delete result.shopOrderValue;
    delete result.bill.costPriceSubTotal;
    return { ...result, createdAt: FieldValue.serverTimestamp() };
  },
  fromFirestore: (
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<OrderDb>
  ): OrderDb => {
    const data = snapshot.data();
    return data;
  }
};

export const createOrderInDb = async (
  user: Request['user'],
  {
    products,
    appliedCoupon,
    itemToQuantity,
    shops,
    bill,
    shopOrderValue,
    orderId
  }: {
    products: Product[];
    itemToQuantity: { [key: string]: number };
    appliedCoupon?: string;
    platformFee: number;
    shops: Shop[];
    bill: OrderDb['bill'];
    shopOrderValue: OrderDb['shopOrderValue'];
    orderId?: string;
  }
) => {
  const ref = firebaseDb.collection('orders');
  const id = orderId || ref.doc().id;
  const orderRefId = Math.floor(Math.random() * 10000);
  const orderDetails: Omit<OrderDb, 'user' | 'userId'> = {
    orderId: id,
    orderRefId: orderRefId.toString(),
    items: products,
    status: 'pending',
    appliedCoupon: appliedCoupon ?? '',
    bill,
    itemToQuantity,
    shops,
    shopOrderValue: shopOrderValue,
    createdAt: Timestamp.now()
  };
  const isInternal =
    user.role === 'admin' || user.role === 'vendor' || user.internal === true;
  if (!orderId) {
    await firebaseDb
      .collection('orders')
      .doc(id)
      .withConverter(publicOrderConverter)
      .create({
        ...orderDetails,
        user: {
          name: user.name ?? '',
          phone: user.phone_number,
          isInternal
        },
        userId: user.uid
      });
    await firebaseDb
      .collection('internal-orders')
      .doc(id)
      .create({
        ...orderDetails,
        user: {
          name: user.name ?? '',
          phone: user.phone_number,
          isInternal
        },
        userId: user.uid
      });
  } else {
    const oldOrderSnap = await firebaseDb
      .collection('orders')
      .doc(id)
      .withConverter(publicOrderConverter)
      .get();
    const oldOrderDetails = oldOrderSnap.data()!;
    await firebaseDb
      .collection('orders')
      .doc(id)
      .withConverter(publicOrderConverter)
      .set({
        ...orderDetails,
        user: oldOrderDetails?.user,
        userId: oldOrderDetails?.userId
      });
    await firebaseDb
      .collection('internal-orders')
      .doc(id)
      .set({
        ...orderDetails,
        user: oldOrderDetails?.user,
        userId: oldOrderDetails?.userId
      });
  }
  return orderDetails;
};
