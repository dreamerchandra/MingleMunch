import { Request, Response } from 'express';
import { firebaseDb } from '../firebase.js';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface HomeOrderDetails {
  quantity: number;
  number: number;
  timeSlot: string;
  userId: string;
  total: number;
  orderDate: Timestamp;
}

const createHomeOrderInDb = (orderDetails: HomeOrderDetails) => {
  return firebaseDb
    .collection('home-orders')
    .add({ ...orderDetails, createdAt: FieldValue.serverTimestamp() });
};

export const createHomeOrder = async (req: Request, res: Response) => {
  const { quantity, number, timeSlot, date } = req.body as Omit<
    HomeOrderDetails,
    'userId' | 'total' | 'timeSlot' | 'orderDate'
  > & { timeSlot: string, date: string };
  const user = req.user;
  const costPerQuantity = quantity === 500 ? 298 : 148;
  const total = costPerQuantity * number;
  const order = await createHomeOrderInDb({
    quantity,
    number,
    timeSlot: timeSlot === '0' ? 'Morning' : 'Evening',
    userId: user.uid,
    total,
    orderDate: Timestamp.fromDate(new Date(date)),
  });
  return res.json(order);
};
