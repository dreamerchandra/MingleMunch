import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import cors from 'cors';
import { updateUser } from './src/router/update-user.js';
import { authMiddle, authorizedAsAdmin } from './src/middleware/auth.js';

const expressApp: Express = express();
expressApp.use(cors({ origin: true }));
expressApp.use(express.json());

expressApp.get('/health', (req: Request, res: Response) => {
  res.send('Ok 👍');
});

expressApp.put('/v1/update-user', authMiddle, authorizedAsAdmin, updateUser);

export const app = functions.https.onRequest(expressApp);
