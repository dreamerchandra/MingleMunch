import { DocumentData, QueryDocumentSnapshot, SnapshotOptions, collection, getDocs, query } from "firebase/firestore";
import { Shop } from "../../common/types/shop";
import { firebaseDb } from "./firebase/db";
import { createKeywords } from "./product";


export const shopConverter = {
    toFirestore(product: Shop): DocumentData {
      const keywords = createKeywords(
        [product.shopName].join(' ')
      );
      return { ...product, keywords };
    },
  
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): Shop {
      const data = snapshot.data(options);
      return { ...data, shopId: snapshot.id } as Shop;
    }
  };

export const getShops = async () => {
    const q = query(
      collection(firebaseDb, 'shop').withConverter(shopConverter),
    );
    const querySnap = await getDocs(q);
    return querySnap.docs.map((doc) => doc.data());
  };