import { Request, Response } from 'express';
import { firebaseDb } from '../firebase.js';
import { getProducts } from '../firestore/product.js';

export const createOrder = async (req: Request, res: Response) => {
  const { itemsId } = req.body as { itemsId: string[] };
  const products = await getProducts(itemsId);
  const { uid } = req.user;
  const subTotal = products.map((p) => p.itemPrice).reduce((a, b) => a + b, 0);
  const tax = 0.18;
  const grandTotal = subTotal + subTotal * tax;
  if (grandTotal > 0) {
    return res.status(400).json({
      error: 'Invalid order'
    });
  }
  const ref = firebaseDb.collection('orders');
  const id = ref.doc().id;
  return firebaseDb.collection('orders').doc(id).create({
    orderId: id,
    userId: uid,
    items: products,
    subTotal,
    tax,
    grandTotal,
    status: 'pending',
    createdAt: new Date(),
    user: req.user
  });
};
