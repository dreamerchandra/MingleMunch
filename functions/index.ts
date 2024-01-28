import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import cors from 'cors';
import { updateUser } from './src/router/update-user.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { createOrder } from './src/router/order.js';
import { fcm, firebaseAuth } from './src/firebase.js';

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
expressApp.post('/v1/notification', authMiddle, authorizedAsAdmin, async (req: Request, res: Response) => {
  const { token, title, body, link, analyticsLabel, data, requireInteraction = false } = req.body;
  await fcm.send({
    token,
    fcmOptions: {
      analyticsLabel: analyticsLabel,
    },
    webpush: {
      notification: {
        title,
        body,
        badge: 'https://delivery.goburn.in/logo.png',
        icon: 'https://delivery.goburn.in/logo.png',
        requireInteraction,
      },
      data: {
        ...data,
        link,
      },
    },
  })
  return res.sendStatus(200);
});
expressApp.post('/v1/order', authMiddle, createOrder);

export const app = functions.https.onRequest(expressApp);
