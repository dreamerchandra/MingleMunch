import { Request, Response } from 'express';
import { firebaseDb } from '../firebase.js';
import { getProducts } from '../firestore/product.js';

export const createOrder = async (req: Request, res: Response) => {
  const { details } = req.body as {
    details: [{ itemId: string; quantity: number }];
  };
  const products = await getProducts(details.map((d) => d.itemId));
  console.log(products, details);
  const { uid } = req.user;
  const detailsToQuantity = details.reduce((acc, d) => {
    acc[d.itemId] = Number(d.quantity);
    return acc;
  }, {} as { [key: string]: number });
  const subTotal = products
    .map((p) => p.itemPrice * detailsToQuantity[p.itemId])
    .reduce((a, b) => a + b, 0);
  console.log(
    products.map((p) => p.itemPrice),
    detailsToQuantity,
    products.map((p) => {
      console.log(typeof p.itemPrice, typeof detailsToQuantity[p.itemId]);
      return p.itemPrice * detailsToQuantity[p.itemId];
    })
  );
  const tax = 0.18;
  const grandTotal = subTotal + subTotal * tax;
  if (grandTotal <= 0) {
    return res.status(400).json({
      error: 'Invalid order'
    });
  }
  const ref = firebaseDb.collection('orders');
  const id = ref.doc().id;
  const orderDetails = {
    orderId: id,
    userId: uid,
    items: products,
    subTotal,
    tax,
    grandTotal,
    status: 'pending',
    createdAt: new Date(),
    user: req.user
  };
  await firebaseDb.collection('orders').doc(id).create(orderDetails);
  return res.status(200).json({
    paymentLink: `upi://pay?pa=nadanavigneshwarar123@oksbi&pn=Nadana Vigneshwarar&aid=uGICAgMDUjJuDNw&am=${grandTotal}&tn=order`,
    orderDetails
  });
};
