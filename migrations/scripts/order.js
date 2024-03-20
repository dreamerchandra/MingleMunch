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

reportMonth = async () => {
  const startDate = new Date();
  startDate.setDate(7);
  startDate.setHours(0, 0, 0, 0);
  startDate.setMonth(1);
  const endDate = new Date();
  endDate.setDate(7);
  endDate.setMonth(2);
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
  const byShop = orders.reduce((acc, order) => {
    const shopsIds = Object.keys(order.shopOrderValue);
    console.log(acc, 'start');
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
    console.log(shopsIds, 'end');
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
  try{

    const spreadsheetId = '1AZ_Vc5vEVSj6gWenJCwYKeMIugQGf1gT2j5YiBPNDxQ';
    const range = 'Sheet1';
    const { google } = await import('googleapis');
    const credential = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log(credential, 'credential')
    const auth = new google.auth.GoogleAuth({
      credentials: credential,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    console.log(auth, 'auth')
    const sheets = google.sheets({ version: 'v4', auth: auth });
    const csv = data.map((o) => Object.values(o)).sort((a, b) => new Date(a[2]).valueOf() - new Date(b[2]).valueOf());
    console.log(csv, 'csv')
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: csv
      }
    });
    console.log('all done')
  }catch(err) {
    console.error(err);
  }
};

const getShopOrderValue = (oldOrder) => {
  return oldOrder.items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        deliveryCharges: deliveryCharges[item.shopId] || 0,
        displaySubTotal: 0,
        costPriceSubTotal: 0,
        parcelChargesTotal: 0,
        costPriceParcelChargesTotal: 0
      };
    }
    acc[item.shopId].displaySubTotal += item.itemPrice * item.quantity;
    acc[item.shopId].costPriceSubTotal += costPcie[item.itemId] * item.quantity;
    acc[item.shopId].parcelChargesTotal +=
      (item.parcelCharges ?? 0) * item.quantity;
    acc[item.shopId].costPriceParcelChargesTotal +=
      parcelCharges[item.itemId] * item.quantity;
    return acc;
  }, {});
};

const getItemToQuantity = (oldOrder) => {
  return oldOrder.items.reduce((acc, item) => {
    if (!acc[item.itemId]) {
      acc[item.itemId] = 0;
    }
    acc[item.itemId] += item.quantity;
    return acc;
  }, {});
};

const getBill = ({ shopOrderValue, platformFee }) => {
  const allShopOrderValue = Object.values(shopOrderValue);
  const displaySubTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.displaySubTotal + s.parcelChargesTotal,
    0
  );
  const parcelChargesTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.parcelChargesTotal,
    0
  );
  const totalDeliveryCharges = allShopOrderValue.reduce(
    (acc, s) => acc + s.deliveryCharges,
    0
  );
  const costPriceSubTotal = allShopOrderValue.reduce(
    (acc, s) => acc + s.costPriceSubTotal + s.costPriceParcelChargesTotal,
    0
  );
  const grandTotalBeforeDiscount =
    displaySubTotal + platformFee + totalDeliveryCharges;
  const discountFee = 0;
  const grandTotal = grandTotalBeforeDiscount - discountFee;
  return {
    subTotal: displaySubTotal,
    platformFee,
    parcelChargesTotal,
    discountFee,
    grandTotalBeforeDiscount,
    grandTotal,
    // costPriceSubTotal,
    deliveryCharges: totalDeliveryCharges
  };
};

const getNewOrder = (oldOrder) => {
  const shopOrderValue = getShopOrderValue(oldOrder);
  const bill = getBill({
    shopOrderValue,
    platformFee: oldOrder.platformFee ?? 3
  });
  const itemToQuantity = getItemToQuantity(oldOrder);
  return {
    ...oldOrder,
    // shopOrderValue,
    bill,
    itemToQuantity,
    orderRefId: oldOrder.orderRefId.split('::')[1],
    user: {
      ...oldOrder.user,
      isInternal: [
        'l7X0GcatMSPoL5CSPbQyJB8la6p1',
        'jTWSyvHmHtbql71Ka1bpOoXUkH33',
        'iCa9lLIZZiZmXCcaskYnvevIOJc2'
      ].includes(oldOrder.userId)
    }
  };
};

const getUniqueShop = (order) => {
  return Object.values(
    order.items.reduce((acc, item) => {
      if (!Object.keys(acc).includes(item.shopDetails.shopId)) {
        acc[item.shopDetails.shopId] = item.shopDetails;
      }
      return acc;
    }, {})
  );
};
const toDecimal = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const migrateProduct = async () => {
  const items = await firebaseDb
    .collection('food')
    .where('shopId', '==', 'ZbxNQlf03EquM9VEuyHA')
    .get();
  // console.log(items.docs.map(d => d.id))

  for (const item of items.docs) {
    const oldOrder = item.data();
    console.log({
      costPrice: toDecimal(oldOrder.itemPrice * 0.95),
      costParcelCharges: oldOrder.parcelCharges || 0
    });
    await firebaseDb
      .collection('food-internal')
      .doc(item.id)
      .set(
        {
          costPrice: toDecimal(oldOrder.itemPrice * 0.92),
          costParcelCharges: oldOrder.parcelCharges || 0
        },
        {
          merge: true
        }
      );
    console.log(item.id);
  }
  // const products = data.docs[0].data() as OldProduct;
  // const costPrice = getCostPrice(products);
  // console.log(costPrice);
};

// migrateProduct()
//   .then(() => {
//     console.log('Migration completed');
//   })
//   .catch((err) => {
//     console.error(err);
//   });

report().then((data) => {
  updateToSheet(data);
})