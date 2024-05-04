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

const report = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 62);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 32);
  endDate.setHours(23, 59, 59, 999);
  const snap = await firebaseDb
    .collection('internal-orders')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();
  const orders = snap.docs
    .map((doc) => doc.data())
    .filter((o) => o.status !== 'rejected');
  const data = orders.map((order) => {
    return {
      name: order.user.name,
      orderId: order.orderId,
      date: order.createdAt
        .toDate()
        .toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        .split(',')
        .join(' '),
      shop: order.shops?.map((s) => s.shopName).join('| ') ?? '',
      quantity: Object.keys(order.itemToQuantity).reduce((acc, key) => {
        return acc + order.itemToQuantity[key];
      }, 0),
      below79: order.items.filter(i => i.itemPrice < 84).length,
      above79: order.items.filter(i => i.itemPrice >= 84).length,
    };
  });
  let _quantity = new Set()
  const byQuality = data.reduce((acc, order) => {
    if (!acc[order.quantity]) {
      acc[order.quantity] = 0;
      acc[`${order.quantity}_below79`] = 0;
      acc[`${order.quantity}_above79`] = 0;
    }
    acc[order.quantity]++;
    acc[`${order.quantity}_below79`] += order.below79;
    acc[`${order.quantity}_above79`] += order.above79;
    _quantity.add(order.quantity)
    return acc;
  }, {});
  console.log(_quantity)
  const q = [..._quantity].sort((a, b) => a - b)
  for(let i = 0; i < q.length; i++) {
    console.log(`${q[i]}, ${byQuality[q[i]]}, ${byQuality[`${q[i]}_below79`]}, ${byQuality[`${q[i]}_above79`]}`)
  }
  
};

report()