import { User } from 'firebase/auth';
import { Product } from './Product';

type OrderStatus = 'pending' | 'ack_from_hotel' | 'prepared' | 'completed';

export interface Order {
  userId: string;
  userDetails: User;
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  tax: number;
  subTotal: number;
  items: Product[];
  orderPayment: string;
  orderPaymentDate: string;
  orderPaymentRefId: string;
  orderPaymentMethod: string;
  orderPaymentAmount: number;
}
