import {  Timestamp } from 'firebase-admin/firestore';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
import { LocationData } from './location.js';
export interface OrderDb {
  orderId: string;
  userId: string;
  items: Product[];
  shops: Shop[];
  orderRefId: string;
  status: string;
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
  locationId: string;
  locationDetails: LocationData;
}
