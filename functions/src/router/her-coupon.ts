import { Request, Response } from 'express';
import { firebaseAuth, firebaseDb } from '../firebase.js';
import { logger } from 'firebase-functions';

/**
 * herCoupon
 * {
 *  <couponCode>: {
 *      ownerId: userId,
 *     usedBy: [userId],
 *  }
 * }
 */

export const canProceedToApply = async (couponCode: string, userId: string) => {
  try {
    const couponRef = await firebaseDb
      .collection('herCoupon')
      .doc(couponCode)
      .get();
    const coupon = couponRef.data();
    if (!coupon) {
      return {
        canProceed: false,
        error: 'Invalid coupon'
      };
    }
    const { usedBy = [], ownerId } = coupon;
    if (ownerId === userId) {
      return {
        canProceed: false,
        error: 'You cant use your own coupon'
      };
    }
    const isNithBro = couponCode === 'NITHBRO';
    if (isNithBro ? usedBy.length >= 50 : usedBy.length >= 2) {
      return {
        canProceed: false,
        error: 'Coupon Limit reached'
      };
    }
    const hasUsed = await firebaseDb
      .collection('herCoupon')
      .where('usedBy', 'array-contains', userId)
      .get();
    if (!hasUsed.empty) {
      return {
        canProceed: false,
        error: 'You have already used a coupon'
      };
    }
    return {
      canProceed: true
    };
  } catch (err) {
    console.log(err);
    return {
      canProceed: false,
      error: 'Something went wrong'
    };
  }
};

export const applyHerCoupon = async (couponCode: string, userId: string) => {
  try {
    const couponRef = await firebaseDb
      .collection('herCoupon')
      .doc(couponCode)
      .get();
    const coupon = couponRef.data();
    if (!coupon) return false;
    const { usedBy = [] } = coupon;
    usedBy.push(userId);
    await firebaseDb
      .collection('herCoupon')
      .doc(couponCode)
      .set({ usedBy }, { merge: true });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const canUseHerCoupon = async (req: Request, res: Response) => {
  const { uid: userId } = req.user;
  const { couponCode } = req.body;
  const data = await canProceedToApply(couponCode, userId);
  return res.json({ data });
};

const checkCouponIfAlreadyExist = async (
  couponCode: string[],
  userId: string
) => {
  const couponRef = await firebaseDb
    .collection('herCoupon')
    .where('ownerId', '==', userId)
    .get();
  if (!couponRef.empty) {
    logger.log('Coupon already exist');
    throw new Error('Coupon already exist');
  }
  for (const code of couponCode) {
    const _code = code.split(' ').join('').toUpperCase();
    const couponRef = await firebaseDb.collection('herCoupon').doc(_code).get();
    logger.log(`Checking for ${_code} exist ${couponRef.exists}`);
    if (!couponRef.exists) {
      return _code;
    }
  }
  logger.log('No coupon available');
  throw new Error('No coupon available');
};

const createMyHerCoupon = async (userId: string) => {
  const user = await firebaseAuth.getUser(userId);
  if (!user) return null;
  const name =
    user.displayName ||
    user.phoneNumber?.split('+91')[1].slice(6, 10) ||
    'THANKS';
  const random5 = [
    name,
    ...Array(5)
      .fill('')
      .map(() => `${name}${Math.floor(Math.random() * 100)}`)
  ];
  logger.log(`Random5: ${random5}`);
  const couponCode = await checkCouponIfAlreadyExist(random5, userId);
  await firebaseDb.collection('herCoupon').doc(couponCode).set({
    ownerId: userId,
    usedBy: []
  });
  logger.log(`Coupon created for ${userId} is ${couponCode}`);
  return couponCode;
};
export const getHerCoupon = async (req: Request, res: Response) => {
  const { uid: userId } = req.user;
  const couponRef = await firebaseDb
    .collection('herCoupon')
    .where('ownerId', '==', userId)
    .get();
  logger.log(`Coupon for ${userId} is empty ${couponRef.empty}`);
  if (couponRef.empty) {
    // const code = await createMyHerCoupon(userId);
    return res.send(400);
  }
  const coupon = couponRef.docs[0].id;
  return res.json({ coupon });
};
