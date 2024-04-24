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


const getUniqueUsers = async () => {
    const users = await firebaseDb.collection('byDate').get()
    const netUsers = []
    for(const user of users.docs) {
        const allUsers = user.data()
        const internal = allUsers.internal || [];
        const actualUsers = Object.keys(allUsers).filter(u => u !== 'internal').filter(u => !internal.includes(u))
        netUsers.push(...actualUsers)
    }
    const uniqueUsers = [...new Set(netUsers)]
    console.log(uniqueUsers.length)
}

getUniqueUsers()