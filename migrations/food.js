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

const shopId = 'lvMUG9qTo08frcVOcKwj';
const getAllProducts = async () => {
  const snap = await firebaseDb.collection('food').where('shopId', '==', shopId).get();
  return snap.docs.map((doc) => doc.data());
};


export {getAllProducts}