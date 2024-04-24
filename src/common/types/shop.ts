export interface Shop {
  shopName: string;
  shopAddress: string;
  shopMapLocation: string;
  shopId: string;
  shopImage: string;
  description: string;
  isOpen: boolean;
  commission: number;
  carousel?: { image: string; url?: string, isPublished: boolean }[];
  tag?: string;
  orderRank: number;
}
