import { Request, Response } from 'express';
import { auth } from '../firebase.js';

export const updateUser = async (req: Request, res: Response) => {
  const { role, userId } = req.body;
  await auth.setCustomUserClaims(userId, { role });
  const user = await auth.getUser(userId);
  res.status(200).json({ user });
};
