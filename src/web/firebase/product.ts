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
import { Shop } from '../../common/types/shop';


export interface ProductInput {
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  itemImage: string;
  isAvailable: boolean;
  shopId: string;
  category: {
    id: string;
    name: string;
  };
  parcelCharges: number;
}

const constructMandatoryMetaFields = () => ({
  updatedAt: Timestamp.now(),
  updateBy: firebaseAuth.currentUser?.uid || ''
});

const constructProduct = (
  productInput: ProductInput,
  shop: Shop
): Omit<Product, 'itemId'> => {
  const { itemName, itemDescription, itemPrice, itemImage } = productInput;
  const shopDetails = {
    shopName: shop.shopName,
    shopAddress: shop.shopAddress,
    shopMapLocation: shop.shopMapLocation,
    shopId: shop.shopId
  };
  return {
    itemName,
    itemDescription,
    itemPrice,
    itemImage,
    shopId: shop.shopId,
    shopDetails,
    isAvailable: true,
    createdAt: Timestamp.now(),
    parcelCharges: productInput.parcelCharges || 0,
    category: {
      id: productInput.category.id,
      name: productInput.category.name
    },
    ...constructMandatoryMetaFields()
  };
};
export const productConverter = {
  toFirestore(product: Product): DocumentData {
    return { ...product, shopId: product.shopId };
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
  shopId: string;
}

export const getProducts = async ({
  search,
  isAvailable,
  shopId
}: ProductQuery) => {
  const queryFns = [
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc')
  ];
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

export const insertProduct = async (product: ProductInput, shop: Shop) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter)
  );
  console.log(constructProduct(product, shop));
  return setDoc(docRef, constructProduct(product, shop));
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
