import type { Timestamp } from 'firebase/firestore';

export interface Product {
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
