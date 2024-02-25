import { logger } from 'firebase-functions';
import { firebaseDb, storage } from '../firebase.js';
import { publicOrderConverter } from './create-order.js';
import { updateWhatsapp } from './twilio.js';

export const generateReport = async ({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const snap = await firebaseDb
    .collection('internal-orders')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .withConverter(publicOrderConverter)
    .get();
  const orders = snap.docs
    .map((doc) => doc.data())
    .filter((o) => !o.user.isInternal)
    .filter((o) => o.status !== 'rejected');
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
        .toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }),
      shop: order.shops?.map((s) => s.shopName).join('| ') ?? '',
      grandTotal: order.bill.grandTotal,
      costPrice: order.bill.costPriceSubTotal,
      deliveryFee: order.bill.deliveryCharges
    };
  });
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
