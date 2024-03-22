type FreeDeliveryShops = {
  deliveryFee: 0;
  minOrderValue: number;
  minOrderDeliveryFee: number; 
}

type NonFreeDeliveryShops = {
  deliveryFee: number;
}


export type Shop = FreeDeliveryShops & NonFreeDeliveryShops & {
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
  platformFee: number;
}
