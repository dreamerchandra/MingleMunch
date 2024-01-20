import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { firebaseDb } from '../firebase.js';
import { Shop } from '../types/Shop.js';

export const shopConverter = {
    toFirestore(product: Shop): DocumentData {
      return { ...product };
    },
  
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
    ): Shop {
      const data = snapshot.data();
      return { ...data, shopId: snapshot.id } as Shop;
    }
  };

export const getShops = async (shopIds: string[]) => {
  logger.log('fetching for shop: ', shopIds);
  const refs = shopIds.map((id) =>
    firebaseDb.doc('shop/' + id).withConverter(shopConverter)
  );
  const shops = await firebaseDb.getAll(...refs);
  return shops.map((p) => p.data()).filter((p) => p != null) as Shop[];
};
