import { Request, Response } from 'express';
import { firebaseDb } from '../firebase.js';
import { getProducts } from '../firestore/product.js';
import { logger } from 'firebase-functions';

export const createOrder = async (req: Request, res: Response) => {
  const { details } = req.body as {
    details: [{ itemId: string; quantity: number }];
  };
  const products = await getProducts(details.map((d) => d.itemId));
  const { uid } = req.user;
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  const subTotal = products
    .map((p) => p.itemPrice * detailsToQuantity[p.itemId])
    .reduce((a, b) => a + b, 0);
  const isAllAvailable = products.every((p) => p.isAvailable);
  if (!isAllAvailable) {
    const nonAvailableItems = products.filter((p) => !p.isAvailable);
    logger.log(
      'some items are not available',
      nonAvailableItems.map((p) => p.itemId)
    );
    return res.status(400).json({
      error: 'Invalid order',
      message: 'Some items are not available',
      products: nonAvailableItems
    });
  }

  const shopIds = products.map((p) => p.shopDetails.shopId);
  const isSameShop = shopIds.every((v) => v === shopIds[0]);
  if (!isSameShop) {
    return res.status(400).json({
      error: 'Invalid order'
    });
  }
  const tax = 0;
  const grandTotal = Math.round(subTotal + subTotal * tax);
  if (grandTotal <= 0) {
    return res.status(400).json({
      error: 'Invalid order'
    });
  }
  const shopDetails = products[0].shopDetails;
  const ref = firebaseDb.collection('orders');
  const id = ref.doc().id;
  const orderRefId = Math.floor(Math.random() * 1000);
  const orderDetails = {
    orderId: id,
    userId: uid,
    items: products.map((p) => ({
      itemName: p.itemName,
      itemPrice: p.itemPrice,
      itemDescription: p.itemDescription,
      itemImage: p.itemImage,
      quantity: detailsToQuantity[p.itemId],
      itemId: p.itemId
    })),
    shopDetails: {
      shopName: shopDetails.shopName,
      shopAddress: shopDetails.shopAddress,
      shopMapLocation: shopDetails.shopMapLocation,
      shopId: shopDetails.shopId
    },
    subTotal,
    tax,
    grandTotal,
    status: 'pending',
    createdAt: new Date(),
    user: {
      name: req.user.name,
      phone: req.user.phone_number
    },
    orderRefId: req.user.phone_number + ':: ' + orderRefId
  };
  await firebaseDb.collection('orders').doc(id).create(orderDetails);
  return res.status(200).json({
    paymentLink: `mohammedashiqcool-3@okicici`,
    ...orderDetails
  });
};
