
interface Item {
  itemName: string;
  itemPrice: number;
  itemDescription: string;
  itemImage: string;
  quantity: number;
  itemId: string;
  shopId: string;
  shopDetails: {
    shopName: string;
    shopAddress: string;
    shopMapLocation: string;
    shopId: string;
  };
}

export interface OrderDb {
  orderId: string;
  userId: string;
  items: Item[];
  subTotal: number;
  deliveryFee: number;
  grandTotal: number;
  status: string;
  createdAt: Date;
  platformFee: number;
  user: {
    name?: string;
    phone: string;
  };
  orderRefId: string;
  appliedCoupon: string;
}
