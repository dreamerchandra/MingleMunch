import { Request, Response } from 'express';
import { firebaseAuth } from '../firebase.js';

export const updateUser = async (req: Request, res: Response) => {
  const { role, userId } = req.body;
  await firebaseAuth.setCustomUserClaims(userId, { role });
  const user = await firebaseAuth.getUser(userId);
  res.status(200).json({ user });
};
