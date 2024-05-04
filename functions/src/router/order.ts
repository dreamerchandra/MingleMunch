import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { HttpError } from '../error.js';
import { getConfig } from '../firestore/app-config.js';
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
import { createOrderInDb } from './create-order.js';
import { getLocationById } from './location.js';

interface OrderBody {
  details: [{ itemId: string; quantity: number }];
  appliedCoupon?: string;
  orderId?: string;
  locationId: string;
}

const getAllData = async (productIds: string[], locationId: string) => {
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
    const string = `${shops.filter((s) => !s.isOpen).map((s) => s.shopName).join(', ')} is closed.`;
    throw new HttpError(400, string, {
      shops: shops.filter((s) => !s.isOpen)
    });
  }
  const locationDetails = await getLocationById(locationId);
  if(!locationDetails) {
    throw new HttpError(400, `Location not found`);
  }
  const updateDeliveryFee = shops.map((s) => ({
    ...s,
    deliveryFee: locationDetails?.deliveryPrice[s.shopId] ?? 0,
  }))
  return { products, shops: updateDeliveryFee, uniqueShopIds, appConfig, shopCommission, locationDetails };
};

const getDeliveryFee = (shop: Shop, itemTotal: number ): number => {
  if(shop.minOrderValue && shop.minOrderDeliveryFee) {
    if(itemTotal >= shop.minOrderValue) {
      return shop.deliveryFee;
    }
    return shop.minOrderDeliveryFee;
  }
  return shop.deliveryFee;
}

const getTotalByShop = (
  products: Product[],
  details: OrderBody['details'],
  shops: Shop[],
  ShopInternal: ShopInternal[]
) => {
  const shopOrderValue = products.reduce((acc, p) => {
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
        parcelChargesTotal: 0,
        displaySubTotal: 0
      };
    }
    acc[shopId].displaySubTotal += p.itemPrice * quantity;
    acc[shopId].costPriceSubTotal += p.costPrice * quantity;
    acc[shopId].parcelChargesTotal += (p?.parcelCharges ?? 0) * quantity;
    acc[shopId].costPriceParcelChargesTotal += (p?.costParcelCharges ?? 0) * quantity;
    return acc;
  }, {} as OrderDb['shopOrderValue']);
  for (const shopId in shopOrderValue) {
    shopOrderValue[shopId].costPriceSubTotal = Math.round(
      shopOrderValue[shopId].costPriceSubTotal
    );
    shopOrderValue[shopId].costPriceParcelChargesTotal = Math.round(
      shopOrderValue[shopId].costPriceParcelChargesTotal
    );
    shopOrderValue[shopId].displaySubTotal = Math.round(
      shopOrderValue[shopId].displaySubTotal
    );
    shopOrderValue[shopId].parcelChargesTotal = Math.round(
      shopOrderValue[shopId].parcelChargesTotal
    );
    const shopDetail = shops.find((s) => s.shopId === shopId);
    shopOrderValue[shopId].deliveryCharges = getDeliveryFee(shopDetail!, shopOrderValue[shopId].displaySubTotal);
  }
  return shopOrderValue;
};

const getDetailsToQuantity = (details: OrderBody['details']) => {
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  return {
    detailsToQuantity
  };
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
  const discountFee = coupon ? totalDeliveryCharges : 0;
  const grandTotal = grandTotalBeforeDiscount - discountFee;
  return {
    subTotal: displaySubTotal,
    platformFee,
    parcelChargesTotal,
    discountFee,
    grandTotalBeforeDiscount: Math.round(grandTotalBeforeDiscount),
    grandTotal: Math.round(grandTotal),
    costPriceSubTotal,
    deliveryCharges: totalDeliveryCharges
  };
};
export const createOrder = async (req: Request, res: Response) => {
  const time = Date.now();
  const { details, appliedCoupon, orderId, locationId } = req.body as OrderBody;
  logger.log(`incoming request payload, ${JSON.stringify(details)}`);
  logger.log(`started ${Date.now() - time}`);
  const productIds = details.map((d) => d.itemId);
  try {
    await canProceedApplyingCoupon(req.user.uid, appliedCoupon);
    const { products, shops, appConfig, shopCommission, locationDetails } = await getAllData(
      productIds,
      locationId
    );
    const { platformFee } = appConfig;
    const { detailsToQuantity } = getDetailsToQuantity(details);
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
        orderId,
        locationId,
        locationDetails
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
        message: err.message,
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
