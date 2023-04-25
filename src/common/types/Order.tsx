import { User } from 'firebase/auth';
import { Product } from './Product';

type OrderStatus = 'pending' | 'ack_from_hotel' | 'prepared' | 'completed';

type OrderProduct = Pick<
  Product,
  | 'itemName'
  | 'itemId'
  | 'itemDescription'
  | 'itemImage'
  | 'itemPrice'
  | 'shopId'
> & {
  quantity: number;
};

export interface Order {
  userId: string;
  userDetails: User;
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  tax: number;
  subTotal: number;
  grandTotal: number;
  items: OrderProduct[];
  orderPayment: string;
  orderPaymentDate: string;
  orderPaymentRefId: string;
  orderPaymentMethod: string;
  orderPaymentAmount: number;
  shopDetails: {
    shopName: string;
    shopAddress: string;
    shopMapLocation: string;
    shopId: string;
  };
}
