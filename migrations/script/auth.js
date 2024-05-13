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
const getUser = async () => {
  const users = await firebaseAuth.listUsers();
  users.users.forEach((u) => {
    console.log(u.displayName, u.phoneNumber, u.uid);
  });
};

getUser().then((users) => {
  console.log(users);
});
