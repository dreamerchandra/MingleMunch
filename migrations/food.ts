import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  DocumentData,
  FieldValue,
  QueryDocumentSnapshot,
  Timestamp,
  getFirestore
} from 'firebase-admin/firestore';
import { costPrie as costPcie, parcelCharges } from './price';

const app = initializeApp({
  credential: applicationDefault()
});

const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);


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

interface OldOrderDb {
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

interface OrderDb {
  orderId: string;
  userId: string;
  items: Item[];
  shops: any[];
  orderRefId: string;
  status: string;
  appliedCoupon: string;
  createdAt: FieldValue;
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
}

const withOldOrder = {
  toFirestore(product: OldOrderDb): DocumentData {
    return { ...product };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): OldOrderDb {
    const data = snapshot.data();
    return data as OldOrderDb;
  }
};

const withNewOrder = {
  toFirestore(product: OrderDb): DocumentData {
    return { ...product };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): OrderDb {
    const data = snapshot.data();
    return data as OrderDb;
  }
};

const getShopOrderValue = (oldOrder: OldOrderDb) => {
  return oldOrder.items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        deliveryCharges: 0,
        displaySubTotal: 0,
        costPriceSubTotal: 0,
        parcelChargesTotal: 0,
        costPriceParcelChargesTotal: 0
      };
    }
    acc[item.shopId].displaySubTotal += item.itemPrice * item.quantity;
    acc[item.shopId].costPriceSubTotal += costPcie[item.shopId] * item.quantity;
    acc[item.shopId].parcelChargesTotal += parcelCharges[item.shopId] * item.quantity;
    acc[item.shopId].costPriceParcelChargesTotal += costPcie[item.shopId] * item.quantity;
    return acc;
  }, {} as OrderDb['shopOrderValue']);
}

const getBill = ({
  shopOrderValue,
  platformFee
}: {
  shopOrderValue: OrderDb['shopOrderValue'];
  platformFee: number;
}): OrderDb['bill'] => {
  const allShopOrderValue = Object.values(shopOrderValue);
  const displaySubTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.displaySubTotal + s.parcelChargesTotal,
    0
  );
  const parcelChargesTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.parcelChargesTotal,
    0
  );
  const totalDeliveryCharges = allShopOrderValue.reduce(
    (acc, s) => acc + s.deliveryCharges,
    0
  );
  const costPriceSubTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.costPriceSubTotal + s.costPriceParcelChargesTotal,
    0
  );
  const grandTotalBeforeDiscount =
    displaySubTotal + platformFee + totalDeliveryCharges;
  const discountFee = 0;
  const grandTotal = grandTotalBeforeDiscount - discountFee;
  return {
    subTotal: displaySubTotal,
    platformFee,
    parcelChargesTotal,
    discountFee,
    grandTotalBeforeDiscount,
    grandTotal,
    costPriceSubTotal,
    deliveryCharges: totalDeliveryCharges
  };
}

const getNewOrder = (oldOrder: OldOrderDb) => {
  const shopOrderValue = getShopOrderValue(oldOrder);
  const bill = getBill({
    shopOrderValue,
    platformFee: oldOrder.platformFee
  });
  return {
    ...oldOrder,
    shopOrderValue,
    bill
  };
}


const migrateProduct = async () => {
  console.log('started')
  const orders = await firebaseDb
    .collection('orders')
    .get();

  for (const order of orders.docs) {
    const oldOrder = order.data() as OldOrderDb;
    const newOrder = getNewOrder(oldOrder);
    await firebaseDb
      .collection('internal-orders')
      .withConverter(withNewOrder)
      .doc(order.id)
      .set(newOrder);
    break;
  }
  // const products = data.docs[0].data() as OldProduct;
  // const costPrice = getCostPrice(products);
  // console.log(costPrice);
}

migrateProduct().then(() => {
  console.log('Migration completed');
}).catch((err) => {
  console.error(err);
});