import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { HttpError } from '../error.js';
import { firebaseDb } from '../firebase.js';
import { AppConfig, getConfig } from '../firestore/app-config.js';
import { getProducts } from '../firestore/product.js';
import {
  ShopInternal,
  getShopCommission,
  getShops
} from '../firestore/shop.js';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
import { OrderDb } from './order-helper.js';
import { updateWhatsapp } from './twilio.js';
import {
  canProceedApplyingCoupon,
  removeCoupon,
  updateFreeDeliveryForInvitedUser
} from './user.js';
import { FieldValue } from 'firebase-admin/firestore';
import { Role } from '../types/roles.js';

interface OrderBody {
  details: [{ itemId: string; quantity: number }];
  appliedCoupon?: string;
  orderId?: string;
}

const getAllData = async (productIds: string[]) => {
  const products = await getProducts(productIds);
  const isAllAvailable = products.every((p) => p.isAvailable);
  if (!isAllAvailable) {
    const nonAvailableItems = products.filter((p) => !p.isAvailable);
    logger.warn(
      'some items are not available',
      nonAvailableItems.map((p) => p.itemId)
    );
    throw new HttpError(400, `Some items are not available`, {
      products: nonAvailableItems
    });
  }
  const uniqueShopIds = [...new Set(products.map((p) => p.shopDetails.shopId))];
  const [shopCommission, shops, appConfig] = await Promise.all([
    await getShopCommission(uniqueShopIds),
    await getShops(uniqueShopIds),
    await getConfig()
  ]);
  if (!appConfig.isOpen) {
    logger.warn(`Ordering is closed. Open by 10Am`);
    throw new HttpError(400, `Ordering is closed`, {
      appConfig
    });
  }
  if (!shops.every((s) => s.isOpen)) {
    logger.warn(
      `some shops are closed ${shops
        .filter((s) => !s.isOpen)
        .map((s) => s.shopId)}`
    );
    throw new HttpError(400, `Some shops are closed`, {
      shops: shops.filter((s) => !s.isOpen)
    });
  }
  return { products, shops, uniqueShopIds, appConfig, shopCommission };
};

const getTotalByShop = (
  products: Product[],
  details: OrderBody['details'],
  shops: Shop[],
  ShopInternal: ShopInternal[]
) => {
  return products.reduce((acc, p) => {
    const shop = shops.find((s) => s.shopId === p.shopDetails.shopId);
    const shopInternal = ShopInternal.find(
      (s) => s.shopId === p.shopDetails.shopId
    );
    if (!shop || !shopInternal) {
      return acc;
    }
    const shopId = p.shopDetails.shopId;
    const quantity = details.find((d) => d.itemId === p.itemId)?.quantity ?? 0;
    if (!acc[shopId]) {
      acc[shopId] = {
        costPriceParcelChargesTotal: 0,
        costPriceSubTotal: 0,
        deliveryCharges: shop.deliveryFee,
        displayParcelChargesTotal: 0,
        displaySubTotal: 0
      };
    }
    acc[shopId].displaySubTotal += p.displayPrice * quantity;
    acc[shopId].costPriceSubTotal += p.costPrice * quantity;
    acc[shopId].displayParcelChargesTotal += p.displayParcelCharges * quantity;
    acc[shopId].costPriceParcelChargesTotal += p.costParcelCharges * quantity;
    return acc;
  }, {} as OrderDb['shopOrderValue']);
};

const getTotal = (details: OrderBody['details']) => {
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  return {
    detailsToQuantity
  };
};

const createOrderInDb = async (
  user: {
    uid: string;
    name?: string;
    phone_number: string;
    role: Role;
  },
  {
    products,
    appliedCoupon,
    itemToQuantity,
    shops,
    bill,
    shopOrderValue,
    orderId
  }: {
    products: Product[];
    itemToQuantity: { [key: string]: number };
    appliedCoupon?: string;
    platformFee: number;
    shops: Shop[];
    bill: OrderDb['bill'];
    shopOrderValue: OrderDb['shopOrderValue'];
    orderId?: string;
  }
) => {
  const ref = firebaseDb.collection('orders');
  const id = orderId || ref.doc().id;
  const orderRefId = Math.floor(Math.random() * 1000);
  const orderDetails: Omit<OrderDb, 'user' | 'userId'> = {
    orderId: id,
    orderRefId: orderRefId.toString(),
    items: products,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    appliedCoupon: appliedCoupon ?? '',
    bill,
    itemToQuantity,
    shops,
    shopOrderValue: shopOrderValue
  };
  if (!orderId) {
    await firebaseDb
      .collection('orders')
      .doc(id)
      .create({
        ...orderDetails,
        user: {
          name: user.name ?? '',
          phone: user.phone_number,
          isInternal: user.role === 'admin' || user.role === 'vendor'
        },
        userId: user.uid
      });
  } else {
    await firebaseDb.collection('orders').doc(id).set(orderDetails, {
      merge: true
    });
  }
  return orderDetails;
};

const getBill = ({
  coupon,
  shopOrderValue,
  platformFee
}: {
  coupon?: string;
  shopOrderValue: OrderDb['shopOrderValue'];
  platformFee: number;
}): OrderDb['bill'] => {
  const allShopOrderValue = Object.values(shopOrderValue);
  const displaySubTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.displaySubTotal + s.displayParcelChargesTotal,
    0
  );
  const displayParcelChargesTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.displayParcelChargesTotal,
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
  const discountFee = coupon ? totalDeliveryCharges : 0;
  const grandTotal = grandTotalBeforeDiscount - discountFee;
  return {
    subTotal: displaySubTotal,
    platformFee,
    displayParcelChargesTotal,
    discountFee,
    grandTotalBeforeDiscount,
    grandTotal,
    costPriceSubTotal,
    deliveryCharges: totalDeliveryCharges
  };
};
export const createOrder = async (req: Request, res: Response) => {
  const time = Date.now();
  const { details, appliedCoupon, orderId } = req.body as OrderBody;
  logger.log(`incoming request payload, ${JSON.stringify(details)}`);
  logger.log(`started ${Date.now() - time}`);
  const productIds = details.map((d) => d.itemId);
  try {
    await canProceedApplyingCoupon(req.user.uid, appliedCoupon);
    const { products, shops, appConfig, shopCommission } = await getAllData(
      productIds
    );
    const { platformFee } = appConfig;
    const { detailsToQuantity } = getTotal(details);
    const shopOrderValue = getTotalByShop(
      products,
      details,
      shops,
      shopCommission
    );
    const bill = getBill({
      coupon: appliedCoupon,
      shopOrderValue,
      platformFee
    });
    logger.info(
      `grand total is ${bill.grandTotal} ${JSON.stringify({
        bill,
        timeTaken: Date.now() - time,
        totalByShop: shopOrderValue
      })}`
    );
    if (bill.grandTotal <= 0) {
      return res.status(400).json({
        error: 'Invalid order'
      });
    }
    const orderDetails = await createOrderInDb(
      { ...req.user, role: req.userRole },
      {
        bill,
        itemToQuantity: detailsToQuantity,
        platformFee,
        products,
        shopOrderValue,
        shops,
        appliedCoupon,
        orderId
      }
    );
    logger.log(`order created ${JSON.stringify(orderDetails)}`);
    logger.log(`time taken ${Date.now() - time}`);
    return res.status(200).json({
      ...orderDetails
    });
  } catch (err) {
    if (err instanceof HttpError) {
      logger.error(`error while creating order ${err.message}`);
      return res.status(400).json({
        error: 'Invalid order',
        message: err.message
      });
    }
    logger.error(`error while creating order ${err}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const onOrderCreate = async (data: OrderDb) => {
  const { user, appliedCoupon, userId } = data;
  await updateWhatsapp({
    message: `New order from ${user.name} and phone number is ${user.phone}`
  });
  await removeCoupon(userId, appliedCoupon);
  await updateFreeDeliveryForInvitedUser(
    `THANK_${user?.name?.substring(0, 4).toUpperCase() ?? 'YOU'}`,
    userId,
    appliedCoupon
  );
};
