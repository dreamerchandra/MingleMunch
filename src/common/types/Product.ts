import type { Timestamp } from 'firebase/firestore';
import { Shop } from './shop';

export interface Product {
  itemId: string;
  isAvailable: boolean;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  itemImage: string;
  keywords: string[];
  shopId: string;
  shopDetails: Omit<Shop, 'shopImage' | 'isOpen' | 'description'>;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  updateBy: string;
  category: {
    id: string;
    name: string;
  };
}
