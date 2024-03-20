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
  startDate.setDate(startDate.getDate() - 4);
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

const updateToSheet = async (data) => {
  try {
    const spreadsheetId = '1AZ_Vc5vEVSj6gWenJCwYKeMIugQGf1gT2j5YiBPNDxQ';
    const range = 'Sheet1';
    const { google } = await import('googleapis');
    const credential = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log(credential, 'credential');
    const auth = new google.auth.GoogleAuth({
      credentials: credential,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    console.log(auth, 'auth');
    const sheets = google.sheets({ version: 'v4', auth: auth });
    const csv = data
      .map((o) => Object.values(o))
      .sort((a, b) => new Date(a[2]).valueOf() - new Date(b[2]).valueOf());
    console.log(csv, 'csv');
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: csv
      }
    });
    console.log('all done');
  } catch (err) {
    console.error(err);
  }
};

report().then((data) => {
  updateToSheet(data);
});
