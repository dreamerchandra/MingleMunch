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
  orderPaymentStatus: string;
  orderPaymentDate: string;
  orderPaymentId: string;
  orderPaymentMethod: string;
  orderPaymentAmount: number;
}
