import express, { Express, Request, Response } from 'express';
import * as functions from 'firebase-functions';
import cors from 'cors';
import { updateUser } from './src/router/update-user.js';
import { authMiddle } from './src/middleware/auth.js';

const expressApp: Express = express();
expressApp.use(cors({ origin: true }));
expressApp.use(express.json());

expressApp.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

expressApp.put('/update-user', authMiddle, updateUser);

export const app = functions.https.onRequest(expressApp);
