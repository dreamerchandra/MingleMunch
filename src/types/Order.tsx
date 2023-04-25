import { Product } from './Product';

type OrderStatus = 'pending' | 'ack_from_hotel' | 'prepared' | 'completed';

export interface Order {
  orderId: string;
  orderDate: string;
  orderStatus: OrderStatus;
  orderTax: number;
  orderSubTotal: number;
  orderGrandTotal: number;
  orderItems: Product[];
  orderPayment: string;
  orderPaymentDate: string;
  orderPaymentRefId: string;
  orderPaymentMethod: string;
  orderPaymentAmount: number;
  orderUserId: string;
  orderUserPhoneNumber: string;
}
