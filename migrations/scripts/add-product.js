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

const addProduct = async () => {
    const orderId = 'o3vBuLN67unTJP7sYU3X'
    const shopId = 'ZbxNQlf03EquM9VEuyHA'
    const orderSnap = await firebaseDb.collection('orders').doc(orderId).get()
    if(!orderSnap.exists) {
        return 'Order not found'
    }
    const productSnap = await firebaseDb.collection('shop').doc(shopId).get()
    if(!productSnap.exists) {
        return 'Product not found'
    }
    const order = orderSnap.data()
    const product = productSnap.data()
    order.shops.push(product)
    await firebaseDb.collection('internal-orders').doc(orderId).update({
        shops: order.shops,
    })
    return {order, product}
}

addProduct().then(console.log).catch(console.error)