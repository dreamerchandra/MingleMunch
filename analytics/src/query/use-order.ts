import { useQuery } from '@tanstack/react-query';
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { firebaseDb } from '../config';

type OrderStatus =
  | 'pending'
  | 'ack_from_hotel'
  | 'prepared'
  | 'picked_up'
  | 'reached_location'
  | 'rejected'
  | 'delivered';
interface Product {
  itemId: string;
  isAvailable: boolean;
  itemImage?: string;
  itemName: string;
  itemDescription: string;
  shopId: string;
  shopDetails: {
    shopName: string;
    shopAddress: string;
    shopMapLocation: string;
    shopId: string;
  };
  updatedAt: Timestamp;
  createdAt: Timestamp;
  updateBy: string;
  itemPrice: number;
  costPrice: number;
  parcelCharges: number;
  costParcelCharges: number;
  suggestionIds?: string[];
  cantOrderSeparately: boolean;
  isRecommended?: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Shop {
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

export interface Order {
  orderId: string;
  userId: string;
  items: Product[];
  shops: Shop[];
  orderRefId: string;
  status: OrderStatus;
  appliedCoupon: string;
  createdAt: Timestamp;
  user: {
    name?: string;
    phone: string;
    isInternal: boolean;
  };
  itemToQuantity: {
    [itemId: string]: number;
  };
  shopOrderValue: {
    [shopId: string]: {
      deliveryCharges: number;
      displaySubTotal: number;
      costPriceSubTotal: number;
      parcelChargesTotal: number;
      costPriceParcelChargesTotal: number;
    };
  };
  bill: {
    subTotal: number;
    platformFee: number;
    parcelChargesTotal: number;
    discountFee: number;
    grandTotalBeforeDiscount: number;
    grandTotal: number;
    costPriceSubTotal: number;
    deliveryCharges: number;
  };
  congestion?: number;
  congestionReportTiming?: Timestamp;
  timeStamps?: Record<OrderStatus, Timestamp>;
  delayReason: Record<OrderStatus, string[]>;
}

const orderConverters = {
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

const getOrders = async () => {
  const snap = await getDocs(
    query(
      collection(firebaseDb, 'internal-orders').withConverter(orderConverters),
      orderBy('createdAt', 'asc')
    )
  );
  return snap.docs.map((doc) => doc.data());
};

export const useOrderQuery = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders()
  });
};
