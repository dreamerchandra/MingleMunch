import { UserRecord } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpError } from '../error.js';
import { firebaseDb } from '../firebase.js';

type User = {
  availableCoupons?: string[];
  myReferralCodes: string;
} | null;

const randomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const checkUniqueCodeInDb = async (codes: string[]): Promise<string> => {
  const snapshot = await firebaseDb
    .collection('users')
    .where('myCode', 'in', codes)
    .get();
  const existingCodes = snapshot.docs.map((doc) => doc.data().myCode);
  const newCodes = codes.filter((code) => !existingCodes.includes(code));
  return newCodes[0];
};

export const onCreateUser = async (user: UserRecord) => {
  const { uid, phoneNumber } = user;
  logger.log('onUserCreate', uid, phoneNumber);
  const randomCodes = Array.from({ length: 20 }, () => randomString(5));
  const code = await checkUniqueCodeInDb(randomCodes);
  const userDb: User = {
    availableCoupons: ['WELCOME'],
    myReferralCodes: code
  };
  return await firebaseDb.doc(`users/${uid}`).set(userDb);
};

export const canProceedApplyingCoupon = async (
  userId: string,
  couponCode?: string
) => {
  if (!couponCode) return true;
  const coupon = await firebaseDb.collection('users').doc(userId).get();
  const user = coupon.data() as User;
  if (!user) return true;
  const { availableCoupons } = user;
  if (availableCoupons?.includes(couponCode)) {
    return true;
  }
  throw new HttpError(400, 'Coupon not valid');
};

export const removeCoupon = async (userId: string, couponCode?: string) => {
  try {
    if (!couponCode) return;
    const userRef = firebaseDb.collection('users').doc(userId);
    await userRef.update({
      availableCoupons: FieldValue.arrayRemove(couponCode)
    });
  } catch (err) {
    logger.error(`Error while removing coupon, ${err}`);
  }
};

export const updateFreeDeliveryForInvitedUser = async (
  newCode: string,
  couponCode?: string
) => {
  try {
    if (!couponCode) return;
    const usersRef = await firebaseDb
      .collection('users')
      .where('myCode', '==', couponCode)
      .get();
    return usersRef.forEach(async (user) => {
      await user.ref.update({
        availableCoupons: FieldValue.arrayUnion(newCode)
      });
    });
  } catch (err) {
    logger.error(`Error while updating free delivery for invited user, ${err}`);
  }
};
