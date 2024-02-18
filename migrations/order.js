const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = initializeApp({
  // credential: './mingle-munch.json',
  credential: applicationDefault()
});
const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);

const internalUserId = [
  // 'jTWSyvHmHtbql71Ka1bpOoXUkH33',
  // 'iCa9lLIZZiZmXCcaskYnvevIOJc2',
  // 'baQNO29pTSfvQstuC4m0k3Cl7JR2',
  // 'TzbS7dGa6JbaM1FQfOCKDpFnyKk1',
  // '3LamWLziVugtAiFXwGbtHST3bJw2',
  // 'eTM7NTZIFyURTlVXTQwXNs4yqI22'
];

const getOrders = async () => {
  const orders = await firebaseDb.collection('food').get();
  // const deletedOrderIds = [];
  // const phoneNumber = [];
  // const orderIds = [];
  // const userName = []
  // const allData = []
  const data = orders.docs[4];
  const id = data.id;
  console.log(id);
  const { parcelCharges, itemPrice, ...rest } = data.data();
  const displayPrice = itemPrice;
  const displayParcelCharges = parcelCharges || 0;
  const costPrice = displayPrice * 0.95;
  const costParcelCharges = displayParcelCharges;
  console.log(data.data());
  // const write = await firebaseDb
  //   .collection('food')
  //   .doc(id)
  //   .update({
  //     ...rest,
  //     displayPrice,
  //     displayParcelCharges,
  //     costPrice,
  //     costParcelCharges
  //   });
  //   console.log(write)
  // const data = orders.docs.map(async (order) => {
  //   const data = order.data();
  //   if(data.displayParcelCharges) {
  //     return;
  //   }

  // });
  // return Promise.all(data);
};

module.exports = getOrders;
