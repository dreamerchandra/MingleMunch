import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { fcm, firebaseDb } from './src/firebase.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { OrderDb } from './src/router/order-helper.js';
import { createOrder, onOrderCreate } from './src/router/order.js';
import { updateUser } from './src/router/update-user.js';
import { onCreateUser, updateReferralCode } from './src/router/user.js';
import { updateWhatsapp } from './src/router/twilio.js';
import { FieldValue } from 'firebase-admin/firestore';

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
      requireInteraction = false,
      notificationData
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
          requireInteraction,
          ...notificationData
        },
        data: {
          ...data,
          link
        }
      }
    });
    return res.json({});
  }
);

expressApp.post('/v1/fcm-analytics', async (req: Request, res: Response) => {
  const { myId, analyticId, action } = req.body;
  if (action === 'received') {
    await firebaseDb.doc(`fcm-analytics/${analyticId}`).set(
      {
        receivedId: FieldValue.arrayUnion(myId)
      },
      {
        merge: true
      }
    );
  } else if (action === 'clicked') {
    await firebaseDb.doc(`fcm-analytics/${analyticId}`).set(
      {
        clickedId: FieldValue.arrayUnion(myId)
      },
      {
        merge: true
      }
    );
  }
  return res.json({});
});

expressApp.post('/v1/fcm-register', async (req: Request, res: Response) => {
  const { analyticId, token } = req.body;
  if(!analyticId || !token) return res.sendStatus(400);
  await firebaseDb.doc(`fcm-tokens/${analyticId}`).set(
    {
      token: FieldValue.arrayUnion(token)
    },
    {
      merge: true
    }
  );
  return res.json({});
});

expressApp.post('/v1/order', authMiddle, createOrder);
expressApp.post('/v1/referral', authMiddle, updateReferralCode);
expressApp.post('/v1/error', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  logger.error(`page not loading for ${phoneNumber}`);
  await updateWhatsapp({ message: `Page not loading for ${phoneNumber}` });
  return res.json({});
});

expressApp.post('/v1/analytics', async (req: Request, res: Response) => {
  const { analyticsId, userId } = req.body;
  const todayDate = new Date().toISOString().split('T')[0];
  await firebaseDb
    .doc(`analytics/${analyticsId}`)
    .collection(todayDate)
    .doc('visit')
    .set(
      {
        visits: FieldValue.increment(1),
        timeStamps: FieldValue.arrayUnion(new Date().toISOString())
      },
      {
        merge: true
      }
    );
  await firebaseDb.doc(`byDate/${todayDate}`).set(
    {
      [analyticsId]: FieldValue.increment(1)
    },
    {
      merge: true
    }
  );
  if (!userId) return res.json({});
  await firebaseDb.doc(`analytics/${analyticsId}`).set(
    {
      userIds: FieldValue.arrayUnion(userId)
    },
    {
      merge: true
    }
  );
  await firebaseDb.doc(`byUser/${todayDate}`).set(
    {
      [userId]: FieldValue.increment(1)
    },
    {
      merge: true
    }
  );
  return res.json({});
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
