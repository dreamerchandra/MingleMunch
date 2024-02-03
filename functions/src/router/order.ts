import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { HttpError } from '../error.js';
import { firebaseDb } from '../firebase.js';
import { AppConfig, getConfig } from '../firestore/app-config.js';
import { getProducts } from '../firestore/product.js';
import { getShops } from '../firestore/shop.js';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
import { OrderDb } from './order-helper.js';
import { updateWhatsapp } from './twilio.js';
import {
  canProceedApplyingCoupon,
  removeCoupon,
  updateFreeDeliveryForInvitedUser
} from './user.js';

interface OrderBody {
  details: [{ itemId: string; quantity: number }];
  appliedCoupon?: string;
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
  const [shops, appConfig] = await Promise.all([
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
  return { products, shops, uniqueShopIds, appConfig };
};

const getTotal = (
  details: OrderBody['details'],
  products: Product[],
  shops: Shop[],
  appConfig: AppConfig,
  appliedCoupon?: string
) => {
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  const itemsTotal = products
    .map((p) => p.itemPrice * detailsToQuantity[p.itemId])
    .reduce((a, b) => a + b, 0);
  const parcelChargesTotal = products
    .map((p) => p.parcelCharges * detailsToQuantity[p.itemId] || 0)
    .reduce((a, b) => a + b, 0);
  const deliveryFee = appliedCoupon
    ? 0
    : shops.reduce((a, b) => a + (b?.deliveryFee ?? 0), 0);
  const { platformFee } = appConfig;
  const grandTotal =
    itemsTotal + deliveryFee + platformFee + parcelChargesTotal;
  return {
    itemsTotal,
    deliveryFee,
    platformFee,
    parcelChargesTotal,
    grandTotal,
    detailsToQuantity
  };
};

const createOrderInDb = async (
  user: {
    uid: string;
    name?: string;
    phone_number: string;
  },
  {
    products,
    detailsToQuantity,
    grandTotal,
    itemsTotal,
    deliveryFee,
    platformFee,
    appliedCoupon
  }: {
    products: Product[];
    detailsToQuantity: { [key: string]: number };
    grandTotal: number;
    itemsTotal: number;
    deliveryFee: number;
    platformFee: number;
    appliedCoupon?: string;
  }
) => {
  const ref = firebaseDb.collection('orders');
  const id = ref.doc().id;
  const orderRefId = Math.floor(Math.random() * 1000);
  const orderDetails: OrderDb = {
    orderId: id,
    userId: user.uid,
    items: products.map((p) => ({
      itemName: p.itemName,
      itemPrice: p.itemPrice,
      itemDescription: p.itemDescription,
      itemImage: p.itemImage ?? '',
      quantity: detailsToQuantity[p.itemId],
      itemId: p.itemId,
      shopId: p.shopDetails.shopId,
      shopDetails: p.shopDetails
    })),
    subTotal: itemsTotal,
    deliveryFee,
    grandTotal,
    status: 'pending',
    createdAt: new Date(),
    platformFee,
    user: {
      name: user.name ?? '',
      phone: user.phone_number
    },
    orderRefId: user.phone_number + ':: ' + orderRefId,
    appliedCoupon: appliedCoupon ?? ''
  };
  await firebaseDb.collection('orders').doc(id).create(orderDetails);
  return orderDetails;
};

export const createOrder = async (req: Request, res: Response) => {
  const time = Date.now();
  const { details, appliedCoupon } = req.body as OrderBody;
  logger.log(`incoming request payload, ${JSON.stringify(details)}`);
  logger.log(`started ${Date.now() - time}`);
  const productIds = details.map((d) => d.itemId);
  try {
    await canProceedApplyingCoupon(req.user.uid, appliedCoupon);
    const { products, shops, appConfig } = await getAllData(productIds);
    const {
      deliveryFee,
      grandTotal,
      itemsTotal,
      parcelChargesTotal,
      platformFee,
      detailsToQuantity
    } = getTotal(details, products, shops, appConfig, appliedCoupon);
    logger.info(
      `grand total is ${grandTotal} ${JSON.stringify({
        grandTotal,
        itemsTotal,
        deliveryFee,
        platformFee,
        parcelChargesTotal,
        timeTaken: Date.now() - time
      })}`
    );
    if (grandTotal <= 0) {
      return res.status(400).json({
        error: 'Invalid order'
      });
    }
    const orderDetails = await createOrderInDb(req.user, {
      products,
      detailsToQuantity,
      grandTotal,
      itemsTotal,
      deliveryFee,
      platformFee,
      appliedCoupon
    });
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
