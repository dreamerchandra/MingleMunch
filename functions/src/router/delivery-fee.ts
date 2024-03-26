import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { Product } from '../types/Product.js';
import { Shop } from '../types/Shop.js';
import { getAllData } from './order.js';

interface DeliveryFee {
  details: [{ itemId: string; quantity: number }];
}

interface FeeDetail {
  amount: number;
  info?: string;
  reason?: string;
}

interface DeliveryFeeResponse {
  deliveryFee: FeeDetail;
  platformFee: FeeDetail;
  convenienceFee: FeeDetail;
  smallCartFree?: Record<string, FeeDetail>;
  overallReason?: Record<string, string>;
}

// clubbed order of two non free delivery shop should have a x value to it
const getNonFreeDeliveryClubbedOrder = (shops: Shop[]): DeliveryFeeResponse => {
  return {
    deliveryFee: {
      amount: 29,
      info: 'This helps our delivery partners to serve you better.'
    },
    platformFee: {
      amount: 4,
      info: 'This small fee helps us to keep this platform running.'
    },
    convenienceFee: {
      amount: 4,
      reason: 'This is a multi shop order hence a small fee is added.',
      info: 'This small fee helps us to keep this platform running.'
    }
  };
};

// free delivery clubbed order of two non free delivery shop should have a x+ value to it
const getFreeDeliveryClubbedOrder = (
  shops: Shop[],
  products: Product[],
  details: DeliveryFee['details']
): DeliveryFeeResponse => {
  const itemPrice = details.reduce((acc, d) => {
    const product = products.find((s) => s.itemId === d.itemId);
    const itemPrice = product!.itemPrice * d.quantity;
    const parcelCharges = (product?.parcelCharges ?? 0) * d.quantity;
    return acc + itemPrice + parcelCharges;
  }, 0);
  const totalByShop = details.reduce((acc, d) => {
    const product = products.find((s) => s.itemId === d.itemId);
    const itemPrice = product!.itemPrice * d.quantity;
    const parcelCharges = (product?.parcelCharges ?? 0) * d.quantity;
    const shopId = product?.shopId ?? '';
    if (!acc[shopId]) {
      acc[shopId] = 0;
    }
    acc[shopId] += itemPrice + parcelCharges;
    return acc;
  }, {} as Record<string, number>);
  const isAllAbove49 = Object.values(totalByShop).every((t) => t > 49);
  if (itemPrice >= 149 && isAllAbove49) {
    return {
      deliveryFee: {
        amount: 0,
        info: 'Woa! Your delivery upon us! Its a free delivery.'
      },
      platformFee: {
        amount: 4,
        info: 'This small fee helps us to keep this platform running.'
      },
      convenienceFee: {
        amount: 4,
        reason: 'This is a multi shop order hence a small fee is added.',
        info: 'This small fee helps us to keep this platform running.'
      }
    };
  }
  const notAbove49 = Object.entries(totalByShop)
    .filter(([, t]) => t <= 49)
    .map(([shopId]) => ({
      shopName: shops.find((s) => s.shopId === shopId)!.shopName,
      shopId
    }));
  return {
    deliveryFee: {
      amount: 0,
      info: 'Woa! Your delivery upon us! Its a free delivery.'
    },
    platformFee: {
      amount: 4,
      info: 'This small fee helps us to keep this platform running.'
    },
    convenienceFee: {
      amount: 4,
      reason: 'This is a multi shop order hence a small fee is added.',
      info: 'This small fee helps us to keep this platform running.'
    },
    smallCartFree: notAbove49.reduce((acc, shop) => {
      acc[shop.shopId] = {
        amount: 10,
        reason:
          itemPrice < 149
            ? 'You are just ₹' +
              (149 - itemPrice) +
              ' away from removing this fee'
            : `Order above ₹49 from ${notAbove49
                .map((s) => s.shopName)
                .join(', ')} shop to remove this fee.`
      };
      return acc;
    }, {} as Record<string, FeeDetail>),
    overallReason: notAbove49.reduce((acc, shop) => {
      acc[shop.shopId] = 'Order above ₹49 to remove small cart fee.';
      return acc;
    }, {} as Record<string, string>)
  };
};

const getSomeFreeDeliveryClubbedOrder = (
  shops: Shop[],
  products: Product[],
  details: DeliveryFee['details']
): DeliveryFeeResponse => {
  const itemPrice = details.reduce((acc, d) => {
    const product = products.find((s) => s.itemId === d.itemId);
    const itemPrice = product!.itemPrice * d.quantity;
    const parcelCharges = (product?.parcelCharges ?? 0) * d.quantity;
    return acc + itemPrice + parcelCharges;
  }, 0);
  const totalByShop = details.reduce((acc, d) => {
    const product = products.find((s) => s.itemId === d.itemId);
    const itemPrice = product!.itemPrice * d.quantity;
    const parcelCharges = (product?.parcelCharges ?? 0) * d.quantity;
    const shopId = product?.shopId ?? '';
    if (!acc[shopId]) {
      acc[shopId] = 0;
    }
    acc[shopId] += itemPrice + parcelCharges;
    return acc;
  }, {} as Record<string, number>);
  const isAllAbove49 = Object.entries(totalByShop)
    .filter(([k]) => {
      const shop = shops.find((s) => s.shopId === k);
      return shop?.deliveryFee === 0;
    })
    .every(([k, t]) => t > 49);
  if (itemPrice >= 149 && !isAllAbove49) {
    const notAbove49 = Object.entries(totalByShop)
      .filter(([k, t]) => {
        const shop = shops.find((s) => s.shopId === k);
        return shop?.deliveryFee === 0 && t <= 49;
      })
      .map(([shopId]) => ({
        shopName: shops.find((s) => s.shopId === shopId)!.shopName,
        shopId
      }));
    return {
      deliveryFee: {
        amount: 25,
        info: 'This helps our delivery partners to serve you better.'
      },
      platformFee: {
        amount: 4,
        info: 'This small fee helps us to keep this platform running.'
      },
      convenienceFee: {
        amount: 4,
        reason: 'This is a multi shop order hence a small fee is added.',
        info: 'This small fee helps us to keep this platform running.'
      },
      smallCartFree: notAbove49.reduce((acc, shop) => {
        acc[shop.shopId] = {
          amount: 10,
          reason:
            itemPrice < 149
              ? 'You are just ₹' +
                (149 - itemPrice) +
                ' away from removing this fee'
              : `Order above ₹49 from ${notAbove49
                  .map((s) => s.shopName)
                  .join(', ')} shop to remove this fee.`
        };
        return acc;
      }, {} as Record<string, FeeDetail>),
      overallReason: notAbove49.reduce((acc, shop) => {
        acc[shop.shopId] = 'Order above ₹49 to remove small cart fee.';
        return acc;
      }, {} as Record<string, string>)
    };
  }
  return {
    deliveryFee: {
      amount: 25,
      info: 'This helps our delivery partners to serve you better.'
    },
    platformFee: {
      amount: 4,
      info: 'This small fee helps us to keep this platform running.'
    },
    convenienceFee: {
      amount: 4,
      reason: 'This is a multi shop order hence a small fee is added.',
      info: 'This small fee helps us to keep this platform running.'
    }
  };
};

const getClubbedOrder = (
  shops: Shop[],
  products: Product[],
  details: DeliveryFee['details']
): DeliveryFeeResponse => {
  const nonFreeDeliveryShops = shops.every((s) => s.deliveryFee > 0);
  if (nonFreeDeliveryShops) {
    return getNonFreeDeliveryClubbedOrder(shops);
  }
  const freeDeliveryShops = shops.every((s) => s.deliveryFee === 0);
  if (freeDeliveryShops) {
    return getFreeDeliveryClubbedOrder(shops, products, details);
  }
  return getSomeFreeDeliveryClubbedOrder(shops, products, details);
};

const getFreeDeliveryNonClubbedOrder = (
  shop: Shop,
  products: Product[],
  details: DeliveryFee['details']
): DeliveryFeeResponse => {
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
    return {
      deliveryFee: {
        amount: shop.minOrderDeliveryFee,
        info: 'This helps our delivery partners to serve you better.',
        reason: 'Order above ₹' + shop.minOrderValue + ' to get free delivery.'
      },
      platformFee: {
        amount: 4,
        info: 'This small fee helps us to keep this platform running.'
      },
      convenienceFee: {
        amount: 0,
        info: ''
      }
    };
  }
  return {
    deliveryFee: {
      amount: 0,
      info: 'Woa! Your delivery upon us! Its a free delivery.'
    },
    platformFee: {
      amount: 4,
      info: 'This small fee helps us to keep this platform running.'
    },
    convenienceFee: {
      amount: 0,
      info: ''
    }
  };
};

export const getOtherFee = (
  shops: Shop[],
  products: Product[],
  details: DeliveryFee['details']
): DeliveryFeeResponse => {
  const isClubbedOrder = shops.length > 1;
  if (isClubbedOrder) {
    return getClubbedOrder(shops, products, details);
  }
  const isFreeDelivery = shops.length === 1 && shops[0].deliveryFee === 0;
  if (isFreeDelivery) {
    logger.log('free delivery');
    return getFreeDeliveryNonClubbedOrder(shops[0], products, details);
  }
  return {
    deliveryFee: {
      amount: shops[0].deliveryFee,
      info: 'This helps our delivery partners to serve you better.'
    },
    platformFee: {
      amount: 4,
      info: 'This small fee helps us to keep this platform running.'
    },
    convenienceFee: {
      amount: 0,
      info: ''
    }
  };
};

export const calculateDeliveryFee = async (req: Request, res: Response) => {
  const { details } = req.body as DeliveryFee;
  logger.info(`incoming request payload, ${JSON.stringify(details)}`);
  const productIds = details.map((d) => d.itemId);
  const data = await getAllData(productIds);
  const deliveryFee = getOtherFee(data.shops, data.products, details);
  return res.status(200).send({ data: deliveryFee });
};
