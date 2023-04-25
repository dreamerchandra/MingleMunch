import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { firebaseDb, firebaseStorage } from './firebase';
import { Product } from '../../common/types/Product';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const createKeywords = (name: string) => {
  const keywords = [];
  for (let i = 0; i < name.length; i++) {
    keywords.push(name.substring(0, i + 1).toLowerCase());
  }
  return keywords;
};

export interface ProductInput {
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  itemImage: string;
}

const trim = (str: string) => str.replace(/\s+/, '').toLocaleLowerCase();

const constructProduct = (
  productInput: ProductInput
): Omit<Product, 'itemId'> => {
  const { itemName, itemDescription, itemPrice, itemImage } = productInput;
  const keywords = createKeywords(
    [trim(itemName), trim(itemDescription)].join(' ')
  );
  const shopDetails = {
    shopName: 'PSG',
    shopAddress: 'PSG',
    shopMapLocation: 'PSG',
    shopId: 'PSG'
  };
  return {
    itemName,
    itemDescription,
    itemPrice,
    itemImage,
    keywords,
    shopId: 'PSG',
    shopDetails
  };
};
export const productConverter = {
  toFirestore(product: Product): DocumentData {
    const keywords = createKeywords(
      [product.itemName, product.itemDescription].join(' ')
    );
    const shopDetails = {
      shopName: 'PSG',
      shopAddress: 'PSG',
      shopMapLocation: 'PSG',
      shopId: 'PSG'
    };
    return { ...product, keywords, shopDetails, shopId: 'PSG' };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Product {
    const data = snapshot.data(options);
    return { ...data, itemId: snapshot.id } as Product;
  }
};

export const getProducts = async () => {
  const q = query(
    collection(firebaseDb, 'food').withConverter(productConverter),
    where('shopId', '==', 'PSG')
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => doc.data());
};

export const updateProduct = async (product: ProductInput) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter)
  );
  return setDoc(docRef, constructProduct(product));
};

export const uploadImage = async (file: File) => {
  const storageRef = ref(firebaseStorage, 'PSG');
  const uploadRef = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadRef.ref);
};
