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

const getOrders = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 250);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);
  const snap = await firebaseDb
    .collection('internal-orders')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();
  const orders = snap.docs
    .map((doc) => doc.data())
    .filter((o) => !o.user.isInternal)
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
      grandTotal: order.bill.grandTotal,
      costPrice: order.bill.costPriceSubTotal,
      deliveryFee: order.bill.deliveryCharges,
      userId: order.userId,
      createdAt: order.createdAt.toDate(),
    };
  });
  return data;
};


const getAOV = async () => {
  const orders = await getOrders();
  const total = orders.reduce((acc, order) => {
    acc += order.grandTotal;
    return acc;
  }, 0);
  console.log('Total', total);
  console.log('AOV', total / orders.length);
}
const getUniqueOrders = async () => {
  const orders = await getOrders();
  const orderByUserId = orders.reduce((acc, order) => {
    if (!acc[order.userId]) {
      acc[order.userId] = [order];
      return acc;
    }
    const lastOrder = acc[order.userId][acc[order.userId].length - 1];
    const thisCreatedAt = new Date(order.createdAt);
    thisCreatedAt.setHours(0, 0, 0, 0);
    const lastCreatedAt = new Date(lastOrder.createdAt);
    lastCreatedAt.setHours(0, 0, 0, 0);
    const sinceLast = thisCreatedAt - lastCreatedAt;
    const lastSinceInDays = Math.floor(sinceLast / (1000 * 60 * 60 * 24));
    acc[order.userId].push({ ...order, sinceLast: lastSinceInDays });
    return acc;
  }, {});
  console.log('orderByUserId', Object.keys(orderByUserId).length);
  
  Object.keys(orderByUserId).forEach((userId) => {
    const orders = orderByUserId[userId];
    if(orders.length < 2) return;
    console.log(orders[0].name, orders.map(o => o.grandTotal))
  })
};

getUniqueOrders();
