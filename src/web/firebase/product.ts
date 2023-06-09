import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { firebaseDb } from './firebase/db';
import { firebaseStorage } from './firebase/storage';
import { firebaseAuth } from './firebase/auth';
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
  isAvailable: boolean;
}

const trim = (str: string) => str.replace(/\s+/, '').toLocaleLowerCase();

const constructMandatoryMetaFields = () => ({
  updatedAt: Timestamp.now(),
  updateBy: firebaseAuth.currentUser?.uid || ''
});

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
    shopDetails,
    isAvailable: true,
    createdAt: Timestamp.now(),
    ...constructMandatoryMetaFields()
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

export interface ProductQuery {
  search: string;
  isAvailable?: boolean;
}

export const getProducts = async ({ search, isAvailable }: ProductQuery) => {
  const queryFns = [where('shopId', '==', 'PSG'), orderBy('createdAt', 'desc')];
  if (isAvailable) {
    queryFns.push(where('isAvailable', '==', isAvailable));
  }
  if (search) {
    queryFns.push(where('keywords', 'array-contains', search.toLowerCase()));
  }
  const q = query(
    collection(firebaseDb, 'food').withConverter(productConverter),
    ...queryFns
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map((doc) => doc.data());
};

export const insertProduct = async (product: ProductInput) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter)
  );
  return setDoc(docRef, constructProduct(product));
};

export const updateProduct = async (
  product: Partial<ProductInput> & { productId: string }
) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter),
    product.productId
  );
  return updateDoc(docRef, { ...product, ...constructMandatoryMetaFields() });
};

export const uploadImage = async (file: File) => {
  const storageRef = ref(
    firebaseStorage,
    `images/${file.name}${Math.random()}`
  );
  const uploadRef = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadRef.ref);
};
