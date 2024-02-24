import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { fcm, firebaseAuth, firebaseDb, storage } from './src/firebase.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { publicOrderConverter } from './src/router/create-order.js';
import { HomeOrderDetails, createHomeOrder } from './src/router/home-order.js';
import { OrderDb } from './src/router/order-helper.js';
import { createOrder, onOrderCreate } from './src/router/order.js';
import { updateWhatsapp } from './src/router/twilio.js';
import { updateUser } from './src/router/update-user.js';
import { onCreateUser, updateReferralCode } from './src/router/user.js';

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

expressApp.post('/v1/order', authMiddle, createOrder);
expressApp.post('/v1/home-order', authMiddle, createHomeOrder);
expressApp.post('/v1/referral', authMiddle, updateReferralCode);
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
      isInternal: isInternal,
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
      message: `New order from ${user.displayName} and phone number is ${user.phoneNumber}. \n Item: Chicken Chukka \n Details are quantity: ${data.quantity}gms, \n number: ${data.number}, \n timeSlot: ${data.timeSlot},\n total Rs. ${data.total}`
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


export const report = functions.region('asia-south1').pubsub.schedule('0 8 * * *').timeZone('Asia/Kolkata').onRun(async (context) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);
  const snap = await firebaseDb.collection('internal-orders').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).withConverter(publicOrderConverter).get();
  const orders = snap.docs.map((doc) => doc.data()).filter(o => !o.user.isInternal).filter(o => o.status !== 'rejected');
  const totalSellPrice = Math.round(orders.reduce((acc, order) => acc + order.bill.grandTotal, 0));
  const totalCostPrice = Math.round(orders.reduce((acc, order) => acc + order.bill.costPriceSubTotal, 0));
  const totalDeliveryCharges = Math.round(orders.reduce((acc, order) => acc + order.bill.deliveryCharges, 0));
  const data = orders.map(order => {
    return {
      name: order.user.name,
      orderId: order.orderId,
      date: order.createdAt.toDate().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }),
      shop: order.shops?.map(s => s.shopName).join('| ') ?? '',
      grandTotal: order.bill.grandTotal,
      costPrice: order.bill.costPriceSubTotal,
      deliveryFee: order.bill.deliveryCharges,
    }
  })
  const timeNow = new Date();
  const reportLocation = `reports/${timeNow.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }).split('/').join('-')}/` + timeNow.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) + '.csv';
  const csv = `name,orderId,time,shop,grandTotal,costPrice,deliveryFee\n${data.map(o => Object.values(o).join(',')).join('\n')}\n,,,,${totalSellPrice},${totalCostPrice},${totalDeliveryCharges}`;
  logger.log('Report for ', startDate.toDateString(), ' is going to upload. [CSV]', csv);
  await storage.bucket('gs://mingle-munch.appspot.com').file(reportLocation).save(csv);
  const file = storage.bucket('gs://mingle-munch.appspot.com').file(reportLocation);
  await file.makePublic();
  const url = file.publicUrl();
  logger.log('Report for ', startDate.toDateString(), ' is ready. [Download]', url);
  await updateWhatsapp({ message: `Report for ${startDate.toDateString()} is ready. [Download](${url})` });
  logger.log(`All done for ${startDate.toDateString()}`);
})