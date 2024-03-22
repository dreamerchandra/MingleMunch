import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { getAllData } from './order.js';
import { Shop } from '../types/Shop.js';
import { Product } from '../types/Product.js';

interface DeliveryFee {
  details: [{ itemId: string; quantity: number }];
}

// clubbed order of two non free delivery shop should have a x value to it
const getNonFreeDeliveryClubbedOrder = (shops: Shop[]) => {
  if (shops.length > 1) {
    const highestDeliveryFee = Math.max(...shops.map((s) => s.deliveryFee));
    return highestDeliveryFee * 1.5;
  }
  return shops[0].deliveryFee;
};

// free delivery clubbed order of two non free delivery shop should have a x+ value to it
const getFreeDeliveryClubbedOrder = (shops: Shop[]) => {
  return 20;
};

const getSomeFreeDeliveryClubbedOrder = (shops: Shop[]) => {
  return 35;
};

const getClubbedOrder = (shops: Shop[]) => {
  const nonFreeDeliveryShops = shops.every((s) => s.deliveryFee > 0);
  if (nonFreeDeliveryShops) {
    return getNonFreeDeliveryClubbedOrder(shops);
  }
  const freeDeliveryShops = shops.every((s) => s.deliveryFee === 0);
  if (freeDeliveryShops) {
    return getFreeDeliveryClubbedOrder(shops);
  }
  const someFreeDeliveryShops = shops.some((s) => s.deliveryFee === 0);
  if (someFreeDeliveryShops) {
    return getSomeFreeDeliveryClubbedOrder(shops);
  }
};

const getFreeDeliveryNonClubbedOrder = (
  shop: Shop,
  products: Product[],
  details: DeliveryFee['details']
) => {
  const total = products.reduce((acc, p) => {
    const itemPrice =
      p.itemPrice * details.find((d) => d.itemId === p.itemId)!.quantity;
    const parcelCharges =
      (p?.parcelCharges ?? 0) *
      details.find((d) => d.itemId === p.itemId)!.quantity;
    return acc + itemPrice + parcelCharges;
  }, 0);
  logger.log('shop.minOrderValue', shop.minOrderValue, total);
  if (total <= shop.minOrderValue) {
    return shop.minOrderDeliveryFee;
  }
  return shop.deliveryFee;
};

const getDeliveryFee = (
  shops: Shop[],
  products: Product[],
  details: DeliveryFee['details']
) => {
  const isClubbedOrder = shops.length > 1;
  if (isClubbedOrder) {
    return getClubbedOrder(shops);
  }
  const isFreeDelivery = shops.length === 1 && shops[0].deliveryFee === 0;
  if (isFreeDelivery) {
    logger.log('free delivery');
    return getFreeDeliveryNonClubbedOrder(shops[0], products, details);
  }
  return shops[0].deliveryFee;
};
export const calculateDeliveryFee = async (req: Request, res: Response) => {
  const { details } = req.body as DeliveryFee;
  logger.info(`incoming request payload, ${JSON.stringify(details)}`);
  const productIds = details.map((d) => d.itemId);
  const data = await getAllData(productIds);
  const deliveryFee = getDeliveryFee(data.shops, data.products, details);
  return res.status(200).send({ deliveryFee });
};
