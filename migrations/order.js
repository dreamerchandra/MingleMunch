const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const {
  costPrie: costPcie,
  parcelCharges,
  deliveryCharges
} = require('./price');
const fs = require('fs');

const app = initializeApp({
  // credential: './mingle-munch.json',
  credential: applicationDefault()
});
const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);

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

const migrateProduct = async () => {
  console.log('started');
  const orders = await firebaseDb.collection('orders').get();

  for (const order of orders.docs) {
    if (order.id === 'NWHXpIn3SCP2Abmju35M') {
      continue;
    }
    const oldOrder = order.data();
    // const newOrder = getNewOrder(oldOrder);
    await firebaseDb
      .collection('orders')
      .doc(order.id)
      .set({
        ...oldOrder,
        shops: getUniqueShop(oldOrder)
      });
    // console.log(getUniqueShop(oldOrder).length);
    // break;
  }
  // const products = data.docs[0].data() as OldProduct;
  // const costPrice = getCostPrice(products);
  // console.log(costPrice);
};

migrateProduct()
  .then(() => {
    console.log('Migration completed');
  })
  .catch((err) => {
    console.error(err);
  });
