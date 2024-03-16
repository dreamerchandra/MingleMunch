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

const isMorning = (date: Date) => {
  const isToday = date.toDateString() === new Date().toDateString();
  if (!isToday) return true;

  // Extract hours and minutes
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Define morning cutoff time (11:30 AM)
  const morningCutoffHour = 11;
  const morningCutoffMinute = 30;

  // Check if it's morning
  if (
    hours < morningCutoffHour ||
    (hours === morningCutoffHour && minutes <= morningCutoffMinute)
  ) {
    return true;
  } else {
    return false;
  }
};

const isEvening = (date: Date) => {
  const isToday = date.toDateString() === new Date().toDateString();
  if (!isToday) return true
  // Extract hours and minutes
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Define evening cutoff time (6:30 PM)
  const eveningCutoffHour = 18;
  const eveningCutoffMinute = 30;

  // Check if it's evening
  if (
    hours < eveningCutoffHour ||
    (hours === eveningCutoffHour && minutes <= eveningCutoffMinute)
  ) {
    return true;
  } else {
    return false;
  }
}

const isValidDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today && date <= new Date(today.setDate(today.getDate() + 7))
} 

export const createHomeOrder = async (req: Request, res: Response) => {
  const { quantity, number, timeSlot, date } = req.body as Omit<
    HomeOrderDetails,
    'userId' | 'total' | 'timeSlot' | 'orderDate'
  > & { timeSlot: string, date: string };
  const orderDate = new Date(date);
  if(!isValidDate(orderDate)) {
    return res.status(400).json({ message: 'Invalid date' });
  } 
  if(timeSlot === '0' && !isMorning(orderDate)) {
    return res.status(400).json({ message: 'Invalid time slot' });
  }
  if(timeSlot === '1' && !isEvening(orderDate)) {
    return res.status(400).json({ message: 'Invalid time slot' });
  }
  const user = req.user;
  const costPerQuantity = quantity === 500 ? 298 : 148;
  const total = costPerQuantity * number;
  const order = await createHomeOrderInDb({
    quantity,
    number,
    timeSlot: timeSlot === '0' ? 'Morning' : 'Evening',
    userId: user.uid,
    total,
    orderDate: Timestamp.fromDate(orderDate),
  });
  return res.json(order);
};
