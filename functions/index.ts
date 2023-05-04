import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import cors from 'cors';
import { updateUser } from './src/router/update-user.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';
import { createOrder } from './src/router/order.js';

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
expressApp.post('/v1/order', authMiddle, createOrder);

export const app = functions.https.onRequest(expressApp);
