export interface Shop {
  shopName: string;
  shopAddress: string;
  shopMapLocation: string;
  shopId: string;
  shopImage: string;
  description: string;
  isOpen: boolean;
  deliveryFee: number;
  carousel?: { image: string; url?: string, isPublished: boolean }[];
}
