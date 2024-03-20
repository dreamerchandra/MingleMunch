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

const getUserIdToDeviceId = async () => {
  const snap = await firebaseDb
    .collection('analytics')
    .where('userIds', '!=', '')
    .get();
  return snap.docs.reduce((acc, doc) => {
    const userIds = doc.data().userIds;
    userIds.forEach((userId) => {
      if (acc[userId] == null) {
        acc[userId] = [];
      }
      acc[userId].push(doc.id);
    });
    return acc;
  }, {});
};

const byDate = async () => {
  const byDate = await firebaseDb.collection('byDate').get();
  const allDevices = [];
  for (const doc of byDate.docs) {
    let userIds = Object.keys(doc.data());
    userIds = userIds.filter((u) => u !== 'internal');
    const internalUsers = doc.data().internal ?? [];
    userIds = userIds.filter((userId) => {
      return !internalUsers.includes(userId);
    });
    allDevices.push(...userIds);
  }

  let uniqueDeviceIds = [...new Set(allDevices)];
  console.log(uniqueDeviceIds.length, 'Unique devices')
  const userIdToDeviceId = await getUserIdToDeviceId();
  const userIds = Object.keys(userIdToDeviceId);
  const duplicateDevices = [];
  for (const userId of userIds) {
    const deviceIds = userIdToDeviceId[userId];
    if (deviceIds.length > 1) {
      duplicateDevices.push(...deviceIds);
    }
  }
  console.log('Duplicate devices', duplicateDevices.length);
  uniqueDeviceIds = uniqueDeviceIds.filter((deviceId) => {
    return !duplicateDevices.includes(deviceId);
  });
  console.log('Unique devices', uniqueDeviceIds.length);
};
byDate();
