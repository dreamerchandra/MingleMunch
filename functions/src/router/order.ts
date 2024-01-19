import { Request, Response } from 'express';
import { firebaseDb } from '../firebase.js';
import { getProducts } from '../firestore/product.js';
import { logger } from 'firebase-functions';
import client from 'twilio';
import dotenv from 'dotenv';
import { getShops } from '../firestore/shop.js';

console.log(process.env.TWILIO_AUTH_TOKEN);
dotenv.config();
const accountSid = 'AC8d9667b8ce34ed5473965c348b3d0d19';
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilio = client(accountSid, authToken);

export const updateWhatsapp = async ({
  name,
  phoneNumber
}: {
  name: string;
  phoneNumber: string;
}) => {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return;
  }
  return twilio.messages
    .create({
      body: `New order from ${name} and phone number is ${phoneNumber}`,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+916374140416'
    })
    .then((message) => console.log(message.sid));
};

export const createOrder = async (req: Request, res: Response) => {
  const { details } = req.body as {
    details: [{ itemId: string; quantity: number }];
  };
  const products = await getProducts(details.map((d) => d.itemId));
  const shops = await getShops(products.map((p) => p.shopDetails.shopId));
  if (!shops.every((s) => s.isOpen)) {
    return res.status(400).json({
      error: 'Invalid order',
      message: 'Some shops are closed'
    });
  }
  const { uid } = req.user;
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  const itemsTotal = products
    .map((p) => p.itemPrice * detailsToQuantity[p.itemId])
    .reduce((a, b) => a + b, 0);
  const parcelChargesTotal = products
    .map((p) => p.parcelCharges * detailsToQuantity[p.itemId])
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
  const deliveryFee = 25;
  const platformFee = 3;
  const grandTotal = Number(
    (itemsTotal + deliveryFee + platformFee + parcelChargesTotal).toFixed(2)
  );
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
    subTotal: itemsTotal,
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
  await updateWhatsapp({
    name: req.user.name,
    phoneNumber: req.user.phone_number
  });
  return res.status(200).json({
    paymentLink: `mohammedashiqcool-3@okicici`,
    ...orderDetails
  });
};
