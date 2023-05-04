export interface Product {
  itemId: string;
  itemName: string;
  isAvailable: boolean;
  itemDescription: string;
  itemPrice: number;
  itemImage: string;
  itemCategoryId: string;
  keywords: string[];
  shopId: string;
  shopDetails: {
    shopName: string;
    shopAddress: string;
    shopMapLocation: string;
    shopId: string;
  };
}
