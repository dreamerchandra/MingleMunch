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

const availableCategory = ['XpozCHQdgE67lyWRAdax', 'hT0fz8Ke3z4LVwxFkQMR', 'D5P6q80F4LXiQVlu1wKA']
const backupOrginalItem = async () => {
  const snap = await firebaseDb
    .collection('food')
    .where('shopId', '==', 'BOmEbao75ZSfXusKIOhi')
    .get();
  for (const doc of snap.docs) {
    const id = doc.id;
    const categoryId = doc.data().category.id;
    if(!availableCategory.includes(categoryId)) {
      console.log(id);
      await firebaseDb.collection('food').doc(id).update({
        isAvailable: false,
      });
    }else {
      console.log(categoryId)
    }
    // await firebaseDb.collection('food').doc(id).update({
    //   isAvailable: false,
    // });
    // break;
  }
};
backupOrginalItem();