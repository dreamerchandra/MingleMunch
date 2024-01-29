import { Product } from './Product';
import { Shop } from './shop';

export type OrderStatus =
  | 'pending'
  | 'ack_from_hotel'
  | 'prepared'
  | 'delivered';

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
  shopDetails?: Shop;
};

export interface Order {
  userId: string;
  userDetails: {
    name: string;
    phone: string;
  };
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
  orderRefId: string;
}
