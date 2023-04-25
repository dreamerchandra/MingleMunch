import { Product } from '../types/Product.js';
import { firebaseDb } from '../firebase.js';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const productConverter = {
  toFirestore(product: Product): DocumentData {
    return { ...product };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Product {
    const data = snapshot.data();
    return data as Product;
  }
};

export const getProducts = async (productIds: string[]) => {
  const snap = await firebaseDb
    .collection('food')
    .where('itemId', 'in', productIds)
    .withConverter(productConverter)
    .get();
  return snap.docs.map((doc) => doc.data());
};
