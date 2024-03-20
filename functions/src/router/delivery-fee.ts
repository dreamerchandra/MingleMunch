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
  return 35;
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

const getFreeDeliveryNonClubbedOrder = (shop: Shop, products: Product[]) => {
  const total = products.reduce((acc, p) => {
    return acc + p.itemPrice + (p.parcelCharges ?? 0);
  }, 0);
  if (total <= shop.minOrderValue) {
    return shop.minOrderDeliveryFee;
  }
  return shop.deliveryFee;
};

const getDeliveryFee = (shops: Shop[], products: Product[]) => {
  const isClubbedOrder = shops.length > 1;
  if (isClubbedOrder) {
    return getClubbedOrder(shops);
  }
  const isFreeDelivery = shops.length === 1 && shops[0].deliveryFee === 0;
  if (isFreeDelivery) {
    return getFreeDeliveryNonClubbedOrder(shops[0], products);
  }
  return shops[0].deliveryFee;
};
export const calculateDeliveryFee = async (req: Request, res: Response) => {
  const { details } = req.body as DeliveryFee;
  logger.info(`incoming request payload, ${JSON.stringify(details)}`);
  const productIds = details.map((d) => d.itemId);
  const data = await getAllData(productIds);
  const deliveryFee = getDeliveryFee(data.shops, data.products);
  return res.status(200).send({ deliveryFee });
};
