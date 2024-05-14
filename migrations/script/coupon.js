const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const fs = require('fs');

const app = initializeApp({
  // credential: './mingle-munch.json',
  credential: applicationDefault()
});
const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);
const storage = getStorage(app);

const getCoupon = async (couponCode) => {
  const snap = await firebaseDb.collection('herCoupon').doc(couponCode).get();
  const data = snap.data();
  const invited = Object.keys(data.invited);
  for (let i = 0; i < invited.length; i++) {
    const user = await firebaseDb.collection('analytics').doc(invited[i]).get();
    if (!user.exists) {
      console.log(invited[i]);
      continue;
    }
    console.log(user.data().userIds);
    const userIds = user.data().userIds ?? [];
    for (let j = 0; j < userIds.length; j++) {
      const user = await firebaseAuth.getUser(userIds[j]);
      console.log(user.displayName);
    }
  }
};

getCoupon('NITHBRO');
