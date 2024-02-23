import { Product } from '../types/Product.js';
import { firebaseDb } from '../firebase.js';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

const productConverter = {
  toFirestore(product: Product): DocumentData {
    return { ...product };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Product {
    const data = snapshot.data();
    return { ...data, itemId: snapshot.id } as Product;
  }
};

export const getProducts = async (productIds: string[]) => {
  logger.log('fetching for products: ', productIds);
  const refs = productIds.map((id) =>
    firebaseDb.doc('food/' + id).withConverter(productConverter)
  );
  const products = await firebaseDb.getAll(...refs);
  const internalRefs = productIds.map((id) =>
    firebaseDb.doc('food-internal/' + id).withConverter(productConverter)
  );
  const snaps = await firebaseDb.getAll(...internalRefs);
  const internalProducts = snaps.map((s) => s.data());
  const getInternalProduct = (id: string) =>
    internalProducts.find((p) => p?.itemId === id);
  const productData = products.map((p) => p.data()).map((p) => p) as Product[];
  return productData.map((p) => ({
    ...p,
    ...getInternalProduct(p.itemId)
  }));
};
