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
  return products.map((p) => p.data()).filter((p) => p != null) as Product[];
};
