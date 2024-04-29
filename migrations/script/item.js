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
    .where('shopId', '==', 'BOmEbao75ZSfXusKIOhi')
    .get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;
    console.log(id);
    await firebaseDb.collection('food').doc(id).update({
      parcelCharges: 0,
    });
    await firebaseDb.collection('food-internal').doc(id).update({
      costParcelCharges: 0,
    });
    // break;
  }
};
backupOrginalItem();
