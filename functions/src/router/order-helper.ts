import { FieldValue } from 'firebase-admin/firestore';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
export interface OrderDb {
  orderId: string;
  userId: string;
  items: Product[];
  shops: Shop[];
  orderRefId: string;
  status: string;
  appliedCoupon: string;
  createdAt: FieldValue;
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
      displayParcelChargesTotal: number;
      costPriceParcelChargesTotal: number;
    };
  };
  bill: {
    subTotal: number;
    platformFee: number;
    displayParcelChargesTotal: number;
    discountFee: number;
    grandTotalBeforeDiscount: number;
    grandTotal: number;
    costPriceSubTotal: number;
    deliveryCharges: number;
  };
}
