import { Request, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpError } from '../error.js';
import { firebaseDb } from '../firebase.js';

type User = {
  availableCoupons?: string[];
  myReferralCodes: string;
  usedCoupons: string[];
  invitedBy?: boolean;
  referredUsers?: Record<
    string,
    {
      name: string;
      hasOrdered: boolean;
    }
  >;
} | null;

const randomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const checkIfReferralCodeExist = async (
  codes: string[]
): Promise<string | null> => {
  const snapshot = await firebaseDb
    .collection('users')
    .where('myReferralCodes', 'in', codes)
    .get();
  const existingCodes = snapshot.docs.map((doc) => doc.data().myReferralCodes);
  const newCodes = codes.filter((code) => !existingCodes.includes(code));
  return newCodes[0];
};

export const onCreateUser = async (user: {
  uid: string;
  phone_number?: string;
}) => {
  const { uid, phone_number } = user;
  logger.log('onUserCreate', uid, phone_number);
  const oldDoc = await firebaseDb.doc(`users/${uid}`).get();
  const oldUser = oldDoc.data();
  if (oldUser?.myReferralCodes) {
    return;
  }
  const randomCodes = Array.from({ length: 20 }, () => randomString(5));
  const code = await checkIfReferralCodeExist(randomCodes);
  const userDb = {
    myReferralCodes: code!
  };
  return await firebaseDb.doc(`users/${uid}`).set(userDb, { merge: true });
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
      availableCoupons: FieldValue.arrayRemove(couponCode),
      usedCoupons: FieldValue.arrayUnion(couponCode)
    });
  } catch (err) {
    logger.error(`Error while removing coupon, ${err}`);
  }
};

const getReferredUser = async (couponCode: string) => {
  const usersRef = await firebaseDb
    .collection('users')
    .where('myReferralCodes', '==', couponCode)
    .get();
  const res = usersRef.docs.map((doc) => doc.data())[0];
  return { ...res, uid: usersRef.docs[0].id } as User & { uid: string };
};

export const updateFreeDeliveryForInvitedUser = async (
  newCode: string,
  appliedUserId: string,
  couponCode?: string
) => {
  try {
    if (!couponCode) return;
    const user = await getReferredUser(couponCode);
    if (!user) return;
    const updateField = `referredUsers.${appliedUserId}.hasOrdered`;
    return await firebaseDb.doc(`users/${user.uid}`).update({
      availableCoupons: FieldValue.arrayUnion(newCode),
      [updateField]: true
    });
  } catch (err) {
    logger.error(`Error while updating free delivery for invited user, ${err}`);
  }
};

export const updateReferralCode = async (req: Request, res: Response) => {
  const uid = req.user.uid;
  const { inviteCode, name } = req.body;
  logger.log('updateReferralCode', uid, inviteCode);
  if (!inviteCode) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }
  const referredUser = await getReferredUser(inviteCode);
  logger.log(`isPresent: ${referredUser}`);
  if (!referredUser) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }
  const { referredUsers } = referredUser;
  const numOfReferredUsers = referredUsers
    ? Object.keys(referredUsers).length
    : 0;
  if (numOfReferredUsers > 2) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }
  const snap = await firebaseDb.doc(`users/${uid}`).get();
  const user = snap.data() || { invitedBy: '' };
  if (user.invitedBy) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }
  await firebaseDb.doc(`users/${referredUser.uid}`).set(
    {
      referredUsers: {
        [uid]: {
          name: name,
          hasOrdered: false
        }
      }
    },
    { merge: true }
  );
  await firebaseDb
    .collection('users')
    .doc(uid)
    .set(
      {
        availableCoupons: FieldValue.arrayUnion(inviteCode),
        invitedBy: referredUser.uid
      },
      {
        merge: true
      }
    );
  return res
    .json({
      message: 'Successfully updated'
    })
    .status(200);
};
