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
// 8056735175

const backupOrginalItem = async () => {
  const snap = await firebaseDb
    .collection('food')
    .where('shopId', '==', 'ZbxNQlf03EquM9VEuyHA')
    .get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;
    console.log(id);
    let itemPrice = data.itemPrice;
    const originalPrice = itemPrice;
    if (itemPrice < 29) {
      itemPrice += 2;
    } else if (itemPrice < 66) {
      itemPrice += 5;
    } else {
      itemPrice += 10;
    }
    await firebaseDb.collection('food').doc(id).update({
      itemPrice,
      originalPrice
    });
    // break;
  }
};
backupOrginalItem();
