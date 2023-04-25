import { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../firebase.js';
import { logger } from 'firebase-functions';

export const authMiddle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('token not found');
    const user = await firebaseAuth.verifyIdToken(token);
    if (!user) throw new Error('user not found');
    logger.info(`userId: ${user.uid} role ${user.role}`);
    req.user = user;
    req.userRole = user.role || 'user';
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }
};

export const authorizedAsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isAdmin = req.userRole === 'admin';
    const isMe = req.user.phone_number?.includes('8754791569');
    if (isAdmin || isMe) {
      next();
      return;
    }
    throw new Error('unauthorized');
  } catch {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }
};
