import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Product } from '../../common/types/Product';
import { Shop } from '../../common/types/shop';
import { firebaseAuth } from './firebase/auth';
import { firebaseDb } from './firebase/db';
import { firebaseStorage } from './firebase/storage';

export interface ProductInput {
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  costPrice: number;
  itemImage: string;
  isAvailable: boolean;
  shopId: string;
  category: {
    id: string;
    name: string;
  };
  parcelCharges: number;
  costParcelCharges: number;
  itemId?: string;
  suggestionIds?: string[];
  cantOrderSeparately: boolean;
  isRecommended: boolean;
}

const constructMandatoryMetaFields = () => ({
  updatedAt: Timestamp.now(),
  updateBy: firebaseAuth.currentUser?.uid || ''
});

const constructProduct = (
  productInput: ProductInput,
  shop: Shop
): Omit<Product, 'itemId' | 'costParcelCharges' | 'costPrice'> => {
  const { itemName, itemDescription, itemPrice, itemImage } = productInput;
  const shopDetails = {
    shopName: shop.shopName,
    shopAddress: shop.shopAddress,
    shopMapLocation: shop.shopMapLocation,
    shopId: shop.shopId,
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
    suggestionIds: productInput.suggestionIds || [],
    cantOrderSeparately: productInput.cantOrderSeparately,
    isRecommended: productInput.isRecommended,
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

export interface ProductsQuery {
  search: string;
  isAvailable?: boolean;
  shopId: string;
}

export const getProducts = async ({
  search,
  isAvailable,
  shopId
}: ProductsQuery) => {
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

export const getProduct = async (
  productId: string,
  { isAdmin }: { isAdmin: boolean }
): Promise<Product> => {
  const q = doc(collection(firebaseDb, 'food'), productId).withConverter(
    productConverter
  );
  const internalQuery = doc(
    collection(firebaseDb, 'food-internal'),
    productId
  ).withConverter(productConverter);
  const [querySnap, internalSnap] = await Promise.all([
    getDoc(q),
    isAdmin ? getDoc(internalQuery) : { data: () => ({}) }
  ]);
  const data = querySnap.data();
  const internalData = internalSnap.data();
  if (!data) throw new Error('Product not found');
  return {
    ...data,
    ...internalData
  };
};

export const insertProduct = async (product: ProductInput, shop: Shop) => {
  const docRef = collection(firebaseDb, 'food').withConverter(productConverter);
  if (product.itemId) {
    return updateProduct({ ...product, productId: product.itemId }, shop);
  }
  console.log('starting to upload')
  const data = await addDoc(docRef, constructProduct(product, shop));
  console.log('data', data.id, product.costPrice, product.costParcelCharges);
  const internalDocRef = doc(collection(firebaseDb, 'food-internal'), data.id);
  return setDoc(internalDocRef, {
    costPrice: product.costPrice,
    costParcelCharges: product.costParcelCharges
  });
};

export const updateProduct = async (
  product: ProductInput & { productId: string },
  shop: Shop
) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter),
    product.productId
  );
  const internalDocRef = doc(
    collection(firebaseDb, 'food-internal'),
    product.productId
  );
  await updateDoc(docRef, constructProduct(product, shop));
  return setDoc(internalDocRef, {
    costPrice: product.costPrice,
    costParcelCharges: product.costParcelCharges
  });
};

export const updateAvailability = ({
  productId,
  isAvailable
}: {
  productId: string;
  isAvailable: boolean;
}) => {
  const docRef = doc(
    collection(firebaseDb, 'food').withConverter(productConverter),
    productId
  );
  return updateDoc(docRef, {
    isAvailable
  });
};

export const uploadImage = async (file: File) => {
  const storageRef = ref(
    firebaseStorage,
    `images/${file.name}${Math.random()}`
  );
  const uploadRef = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadRef.ref);
};
