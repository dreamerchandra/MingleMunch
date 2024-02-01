const fs = require('fs');
const csv = require('csv-parser');
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = initializeApp({
  // credential: './mingle-munch.json',
  credential: applicationDefault()
});
const firebaseAuth = getAuth(app);
const firebaseDb = getFirestore(app);

const createKeywords = (name) => {
  const keywords = [];
  for (let i = 0; i < name.length; i++) {
    keywords.push(name.substring(0, i + 1).toLowerCase());
  }
  return keywords;
};

const trim = (str) => str.replace(/\s+/, '').toLocaleLowerCase();

const constructMandatoryMetaFields = (time) => ({
  updatedAt: time,
  updateBy: 'jTWSyvHmHtbql71Ka1bpOoXUkH33'
});

const constructProduct = (productInput, shop, category, FieldValue) => {
  const {
    itemName,
    itemDescription = '',
    itemPrice,
    parcelCharges
  } = productInput;
  const shopDetails = {
    shopName: shop.shopName,
    shopAddress: shop.shopAddress,
    shopMapLocation: shop.shopMapLocation,
    shopId: shop.shopId
  };
  return {
    itemName,
    itemDescription,
    itemImage: '',
    itemPrice,
    shopId: shop.shopId,
    shopDetails,
    isAvailable: true,
    createdAt: FieldValue.serverTimestamp(),
    parcelCharges: parcelCharges || 0,
    category: {
      id: category.id,
      name: category.name
    },
    ...constructMandatoryMetaFields(FieldValue.serverTimestamp())
  };
};

/** @param { import('fireway').MigrateOptions } */
// eslint-disable-next-line no-undef
const migrate = async () => {
  console.log('migration v0.0.3');
  const snap = await firebaseDb.doc('shop/AGsSfba8AK8HL8KOIRzh').get();
  const shop = snap.data();
  console.log(shop);
  if (!shop) return;
  const category = {
    id: 'FsOeAyVcT5qZc0fW1H7G',
    name: 'Soup'
  };
  const results = [];

  return new Promise((res) => {
    fs.createReadStream('./green_banana_veg_gravy.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const { item, price, description, parcelCharges = 0 } = row;
        // console.log(row);
        if (!item) {
          return;
        }
        // // Process each row of the CSV file
        const res = await firebaseDb.collection('food').add(
          constructProduct(
            {
              itemName: item,
              itemPrice: Number(price),
              itemDescription: description,
              parcelCharges: Number(parcelCharges)
            },
            shop,
            category,
            FieldValue
          )
        );
        const data = (await res.get()).id;
        results.push(data);
      })
      .on('end', () => {
        res(results);
        console.log('CSV file successfully processed');
      });
  });
};

const fetchItems = async (res) => {
  const shopId = 'AGsSfba8AK8HL8KOIRzh';
  const ref = firebaseDb.collection('food');
  const query = ref
    .where('shopId', '==', shopId)
    .where('category.id', '==', 'tuU3hBwQKRbZJruo1G2N');
  //Mm0Mhd7lolIQ88jdxiP1
  const snap = await query.get();
  const items = [];
  snap.forEach(async (doc) => {
    const data = doc.data();
    const updatedData = {
      ...data,
      shopId: 'MZWXNkOyexhAvNlBG9l2',
      shopDetails: {
        shopMapLocation: 'https://maps.app.goo.gl/KKuJjeCGUvmMd3aw7',
        shopName: 'Green Leaf',
        shopId: 'MZWXNkOyexhAvNlBG9l2',
        shopAddress: 'Saravanampatti'
      },
      category: {
        id: 'dCzWKt4c9TAGVLjaSNz2',
        name: 'Biriyani'
      },
    };
    items.push(updatedData);
  });
  await Promise.all(items.map(i => firebaseDb.collection('food').add(i)));
  return items;
};

fetchItems().then((items) => {
  console.log('Migration completed', items.length);
});
