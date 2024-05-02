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
  startDate.setDate(startDate.getDate() - 1);
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
      deliveryFee: order.bill.deliveryCharges
    };
  });
  return data;
};

const reportMonth = async () => {
  const startDate = new Date();
  startDate.setDate(8);
  startDate.setHours(0, 0, 0, 0);
  startDate.setMonth(2);
  const endDate = new Date();
  endDate.setDate(7);
  endDate.setMonth(3);
  endDate.setHours(23, 59, 59, 0);
  console.log(startDate.toLocaleString(), endDate.toLocaleString());
  const snap = await firebaseDb
    .collection('internal-orders')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();
  const orders = snap.docs
    .map((doc) => doc.data())
    .filter((o) => !o.user.isInternal)
    .filter((o) => o.status !== 'rejected');
  const byShop = orders.reduce((acc, order) => {
    const shopsIds = Object.keys(order.shopOrderValue);
    // console.log(acc, 'start');
    shopsIds.forEach((shopId) => {
      if (!acc[shopId]) {
        acc[shopId] = {
          costPriceParcelChargesTotal: 0,
          costPriceSubTotal: 0,
          deliveryCharges: 0,
          displaySubTotal: 0,
          parcelChargesTotal: 0,
          count: 0,
          shpName: order.shops.find((s) => s.shopId === shopId).shopName
        };
      }
      acc[shopId].count += 1;
      acc[shopId].costPriceParcelChargesTotal +=
        order.shopOrderValue[shopId].costPriceParcelChargesTotal;
      acc[shopId].costPriceSubTotal +=
        order.shopOrderValue[shopId].costPriceSubTotal;
      acc[shopId].deliveryCharges +=
        order.shopOrderValue[shopId].deliveryCharges;
      acc[shopId].displaySubTotal +=
        order.shopOrderValue[shopId].displaySubTotal;
      acc[shopId].parcelChargesTotal +=
        order.shopOrderValue[shopId].parcelChargesTotal;
    });
    // console.log(shopsIds, 'end');
    return acc;
  }, {});
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
      deliveryFee: order.bill.deliveryCharges
    };
  });
  return { data, byShop };
};

const updateToSheet = async (data) => {
  const spreadsheetId = '1AZ_Vc5vEVSj6gWenJCwYKeMIugQGf1gT2j5YiBPNDxQ';
  const range = 'Sheet1';
  const { google } = await import('googleapis');
  const credential = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials: credential,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: auth });
  const csv = data
    .map((o) => Object.values(o))
    .sort((a, b) => new Date(a[2]).valueOf() - new Date(b[2]).valueOf());
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: csv
    }
  });
};


report().then(data => {
  updateToSheet(data)
  console.log(data)
})