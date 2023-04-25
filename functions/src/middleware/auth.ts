import { NextFunction, Request, Response } from 'express';
import { auth } from '../firebase.js';
import { logger } from 'firebase-functions';

export const authMiddle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token);
    if (!token) throw new Error('token not found');
    const user = await auth.verifyIdToken(token);
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
    if (req.userRole !== 'admin') throw new Error('unauthorized');
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }
};
