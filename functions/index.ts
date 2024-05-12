import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { fcm, firebaseAuth, firebaseDb } from './src/firebase.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { HomeOrderDetails, createHomeOrder } from './src/router/home-order.js';
import { OrderDb } from './src/router/order-helper.js';
import { createOrder, onOrderCreate } from './src/router/order.js';
import {
  generateReport,
  getLastDayReport,
  updateLTAReport
} from './src/router/report.js';
import { createZendutyIncident, updateWhatsapp } from './src/router/twilio.js';
import { updateUser } from './src/router/update-user.js';
import { onCreateUser, updateReferralCode } from './src/router/user.js';
import { Shop } from './src/types/Shop.js';
import { canUseHerCoupon, getHerCoupon } from './src/router/her-coupon.js';

const expressApp: Express = express();
expressApp.use(cors({ origin: true }));
expressApp.use(express.json());

expressApp.get('/health', (req: Request, res: Response) => {
  res.send('Ok 👍');
});
expressApp.post('/v1/today', (req: Request, res: Response) => {
  const date = new Date();
  return res.json({ date: date.toISOString() });
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
          badge: 'https://delivery.goburn.in/logo_v1.png',
          icon: 'https://delivery.goburn.in/logo_v1.png',
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
  if (!analyticId || !token) return res.sendStatus(400);
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

expressApp.post('/v1/invited-ack', async (req: Request, res: Response) => {
  try {
    const { coupon, deviceId } = req.body;
    logger.log(`invited-ack started ${coupon} ${deviceId}`);
    const snap = await firebaseDb.doc(`herCoupon/${coupon}`).get();
    const oldInviteesData = snap.data()?.invited ?? {};
    await firebaseDb.doc(`herCoupon/${coupon}`).update({
      invited: {
        ...oldInviteesData,
        [deviceId as string]: FieldValue.serverTimestamp()
      }
    });
    logger.log(`invited-ack done ${coupon} ${deviceId}`);
    return res.send(200);
  } catch (err) {
    logger.error(`Error in invited-ack ${err}`);
    return res.sendStatus(500);
  }
});

expressApp.post('/v1/order', authMiddle, createOrder);
expressApp.post('/v1/home-order', authMiddle, createHomeOrder);
expressApp.post('/v1/referral', authMiddle, updateReferralCode);
expressApp.post('/v1/shop', authMiddle, authorizedAsAdmin, async (req, res) => {
  const { commission, ...rest } = req.body as Shop;
  const response = await firebaseDb.collection('shop').add({
    ...rest
  });
  await firebaseDb.doc(`shop-internals/${response.id}`).set({
    commission,
    shopId: response.id
  });
  return res.json({ id: response.id });
});
expressApp.post('/v1/canUseHerCoupon', authMiddle, canUseHerCoupon);
expressApp.get('/v1/her-coupon', authMiddle, getHerCoupon);
expressApp.post(
  '/v1/onboard-referral',
  authMiddle,
  async (req: Request, res: Response) => {
    await onCreateUser(req.user);
    return res.json({});
  }
);
expressApp.post('/v1/error', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  logger.error(`page not loading for ${phoneNumber}`);
  await updateWhatsapp({ message: `Page not loading for ${phoneNumber}` });
  return res.json({});
});

expressApp.post('/v1/analytics', async (req: Request, res: Response) => {
  const { analyticsId, userId, isInternal } = req.body;
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
    isInternal
      ? {
          [analyticsId]: FieldValue.increment(1),
          internal: FieldValue.arrayUnion(analyticsId)
        }
      : {
          [analyticsId]: FieldValue.increment(1)
        },
    {
      merge: true
    }
  );
  if (!userId) {
    await firebaseDb.doc(`analytics/${analyticsId}`).set({
      isInternal: isInternal
    });
    return res.json({});
  }
  await firebaseDb.doc(`analytics/${analyticsId}`).set(
    {
      userIds: FieldValue.arrayUnion(userId),
      isInternal: isInternal
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

export const onOrderCreated = functions
  .region('asia-south1')
  .firestore.document('orders/{orderId}')
  .onCreate(async (snap) => {
    const data = snap.data() as OrderDb;
    logger.log(`on order created ${JSON.stringify(data)}`);
    await onOrderCreate(data);
  });

export const onHomeOrderCreated = functions
  .region('asia-south1')
  .firestore.document('home-orders/{orderId}')
  .onCreate(async (snap) => {
    const data = snap.data() as HomeOrderDetails;
    logger.log(`on order created ${JSON.stringify(data)}`);
    const user = await firebaseAuth.getUser(data.userId);
    await updateWhatsapp({
      message: `New order from ${user.displayName} and phone number is ${
        user.phoneNumber
      }. \n Date ${data.orderDate.toDate().toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata'
      })}\n Item: Chicken Chukka \n Details are quantity: ${
        data.quantity
      }gms, \n number: ${data.number}, \n timeSlot: ${
        data.timeSlot
      },\n total Rs. ${data.total}`
    });
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

export const report = functions
  .region('asia-south1')
  .pubsub.schedule('0 8 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
    const report = await getLastDayReport();
    await generateReport(report);
    await updateLTAReport(report);
    return;
  });

export const checkShopClosedStatusMorning = functions
  .region('asia-south1')
  .pubsub.schedule('35 11 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const appConfig = await firebaseDb.doc('appConfig/public').get();
    const isOpen = appConfig.data()?.isOpen;
    if (isOpen) {
      return;
    }
    await createZendutyIncident();
    await updateWhatsapp({
      message: `Open the Shop immediately.`
    });

    return;
  });

export const checkShopClosedStatusEvening = functions
  .region('asia-south1')
  .pubsub.schedule('35 6 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const appConfig = await firebaseDb.doc('appConfig/public').get();
    const isOpen = appConfig.data()?.isOpen;
    if (isOpen) {
      return;
    }
    await createZendutyIncident();
    await updateWhatsapp({
      message: `Open the Shop immediately.`
    });

    return;
  });

export const triggerReport = functions
  .region('asia-south1')
  .https.onRequest(async (req, res) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
    const report = await getLastDayReport();
    await generateReport(report);
    res.json({ ok: true });
  });
