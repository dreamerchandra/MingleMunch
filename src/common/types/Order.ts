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
  assignedTo?: string[];
  paymentCollector: string;
  paymentCollectorName: string;
  assigneeName: string;
}
