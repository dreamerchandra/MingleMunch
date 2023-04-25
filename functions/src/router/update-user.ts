import { Request, Response } from 'express';
import { firebaseAuth } from '../firebase.js';
import { logger } from 'firebase-functions';

export const updateUser = async (req: Request, res: Response) => {
  const { role, userId } = req.body;
  logger.log(`Updating user ${userId} to ${role}`);
  await firebaseAuth.setCustomUserClaims(userId, { role });
  logger.log(`Updated user ${userId} to ${role}`);
  const user = await firebaseAuth.getUser(userId);
  res.status(200).json({ user });
};
