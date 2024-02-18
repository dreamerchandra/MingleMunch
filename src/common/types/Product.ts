import type { Timestamp } from 'firebase/firestore';
import { Shop } from './shop';

export interface Product {
  itemId: string;
  isAvailable: boolean;
  isRecommended?: boolean;
  itemName: string;
  itemDescription: string;
  displayPrice: number;
  costPrice: number;
  itemImage: string;
  shopId: string;
  shopDetails: Omit<Shop, 'shopImage' | 'isOpen' | 'description' | 'commission'>;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  updateBy: string;
  category: {
    id: string;
    name: string;
  };
  displayParcelCharges: number;
  costParcelCharges: number;
  suggestionIds?: string[];
  cantOrderSeparately: boolean;
}
