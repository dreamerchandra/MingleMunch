import { Timestamp } from 'firebase/firestore';
import { Product } from './Product';
import { Shop } from './shop';

export type OrderStatus =
  | 'pending'
  | 'ack_from_hotel'
  | 'prepared'
  | 'picked_up'
  | 'reached_location'
  | 'rejected'
  | 'delivered';

export type CartProduct = Product & { parentItemId?: string };

interface OrderItem {
  itemId: string;
  quantity: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: CartProduct[];
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
  assignedTo?: string[];
  paymentCollector: string;
  paymentCollectorName: string;
  assigneeName: string;
  orderHandlers: string[];
  details: [
    {
      itemId: string;
      quantity: number;
      subProducts: OrderItem[];
      parentItemId?: string;
    }
  ];
}
