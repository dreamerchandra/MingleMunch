export interface Product {
  itemId: string;
  isAvailable: boolean;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  itemImage: string;
  keywords: string[];
  shopId: string;
  shopDetails: {
    shopName: string;
    shopAddress: string;
    shopMapLocation: string;
    shopId: string;
  };
}
