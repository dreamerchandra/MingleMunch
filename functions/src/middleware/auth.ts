import { NextFunction, Request, Response } from 'express';
import { auth } from '../firebase.js';

export const authMiddle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('token not found');
    const user = await auth.getUser(token);
    if (!user) throw new Error('user not found');
    req.user = user;
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }
};
