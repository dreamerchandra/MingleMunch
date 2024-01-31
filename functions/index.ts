import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { fcm } from './src/firebase.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { OrderDb } from './src/router/order-helper.js';
import { createOrder, onOrderCreate } from './src/router/order.js';
import { updateUser } from './src/router/update-user.js';
import { onCreateUser, updateReferralCode } from './src/router/user.js';
import { updateWhatsapp } from './src/router/twilio.js';

const expressApp: Express = express();
expressApp.use(cors({ origin: true }));
expressApp.use(express.json());

expressApp.get('/health', (req: Request, res: Response) => {
  res.send('Ok 👍');
});

expressApp.get('/migrate', (req: Request, res: Response) => {
  res.send('Ok 👍');
});

expressApp.put('/v1/update-user', authMiddle, authorizedAsAdmin, updateUser);
expressApp.post(
  '/v1/notification',
  authMiddle,
  authorizedAsAdmin,
  async (req: Request, res: Response) => {
    const {
      token,
      title,
      body,
      link,
      analyticsLabel,
      data,
      requireInteraction = false
    } = req.body;
    await fcm.send({
      token,
      fcmOptions: {
        analyticsLabel: analyticsLabel
      },
      webpush: {
        notification: {
          title,
          body,
          badge: 'https://delivery.goburn.in/logo.png',
          icon: 'https://delivery.goburn.in/logo.png',
          requireInteraction
        },
        data: {
          ...data,
          link
        }
      }
    });
    return res.sendStatus(200);
  }
);
expressApp.post('/v1/order', authMiddle, createOrder);
expressApp.post('/v1/referral', authMiddle, updateReferralCode);
expressApp.post('/v1/error', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  logger.error(`page not loading for ${phoneNumber}`);
  await updateWhatsapp({ message: `Page not loading for ${phoneNumber}` });
  return res.sendStatus(200);
});

export const onUserCreate = functions
  .region('asia-south1')
  .auth.user()
  .onCreate(onCreateUser);

export const onOrderCreated = functions
  .region('asia-south1')
  .firestore.document('orders/{orderId}')
  .onCreate(async (snap) => {
    const data = snap.data() as OrderDb;
    logger.log(`on order created ${JSON.stringify(data)}`);
    await onOrderCreate(data);
  });

export const order = functions
  .runWith({
    maxInstances: 3,
    minInstances: 1,
    memory: '128MB',
    labels: { name: 'order' }
  })
  .region('asia-south1')
  .https.onRequest(expressApp);
