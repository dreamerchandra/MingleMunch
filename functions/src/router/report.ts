import { logger } from 'firebase-functions';
import { firebaseDb, storage } from '../firebase.js';
import { publicOrderConverter } from './create-order.js';
import { updateWhatsapp } from './twilio.js';
import { applicationDefault } from 'firebase-admin/app';

export const getLastDayReport = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);
  const snap = await firebaseDb.collection('internal-orders').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).withConverter(publicOrderConverter).get();
  const orders = snap.docs.map((doc) => doc.data()).filter((o) => !o.user.isInternal).filter((o) => o.status !== 'rejected');
  const totalSellPrice = Math.round(
    orders.reduce((acc, order) => acc + order.bill.grandTotal, 0)
  );
  const totalCostPrice = Math.round(
    orders.reduce((acc, order) => acc + order.bill.costPriceSubTotal, 0)
  );
  const totalDeliveryCharges = Math.round(
    orders.reduce((acc, order) => acc + order.bill.deliveryCharges, 0)
  );
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
  return {
    data,
    totalSellPrice,
    totalCostPrice,
    totalDeliveryCharges,
    startDate,
    endDate
  };
};

export const generateReport = async (
  param: Awaited<ReturnType<typeof getLastDayReport>>
) => {
  const {
    startDate,
    data,
    totalCostPrice,
    totalDeliveryCharges,
    totalSellPrice
  } = param;
  const timeNow = new Date();
  const reportLocation =
    `reports/${timeNow
      .toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })
      .split('/')
      .join('-')}/` +
    timeNow.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) +
    '.csv';
  const csv = `name,orderId,time,shop,grandTotal,costPrice,deliveryFee\n${data
    .map((o) => Object.values(o).join(','))
    .join(
      '\n'
    )}\n,,,,${totalSellPrice},${totalCostPrice},${totalDeliveryCharges}`;
  logger.log(
    'Report for ',
    startDate.toDateString(),
    ' is going to upload. [CSV]',
    csv
  );
  await storage
    .bucket('gs://mingle-munch.appspot.com')
    .file(reportLocation)
    .save(csv);
  const file = storage
    .bucket('gs://mingle-munch.appspot.com')
    .file(reportLocation);
  await file.makePublic();
  const url = file.publicUrl();
  logger.log(
    'Report for ',
    startDate.toDateString(),
    ' is ready. [Download]',
    url
  );
  await updateWhatsapp({
    message: `Report for ${startDate.toDateString()} is ready. [Download](${url})`
  });
  logger.log(`All done for ${startDate.toDateString()}`);
};

export const updateLTAReport = async (
  param: Awaited<ReturnType<typeof getLastDayReport>>
) => {
  const { google } = await import('googleapis');
  const { data } = param;
  const jwtAccess = new google.auth.JWT();
  console.log(applicationDefault());
  const credential = await google.auth.getApplicationDefault();
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(JSON.stringify(credential.credential.credentials)),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Sheet1';
  const sheets = google.sheets({ version: 'v4', auth: auth });
  const csv = data
    .map((o) => Object.values(o))
    .sort(
      (a, b) =>
        new Date(a[2] as string).valueOf() - new Date(b[2] as string).valueOf()
    );

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: csv
    }
  });
  await updateWhatsapp({
    message: `FUll report updated. Access at https://docs.google.com/spreadsheets/d/1AZ_Vc5vEVSj6gWenJCwYKeMIugQGf1gT2j5YiBPNDxQ/edit?usp=sharing`
  });
};
