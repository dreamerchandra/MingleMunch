import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { firebaseDb } from '../../firebase/firebase/db';

export interface CategoryInput {
  categoryName: string;
  shopId: string;
}

export type Category = {
  categoryId: string;
  categoryName: string;
  shopId: string;
};

const categoryConverter = {
  toFirestore: (category: Category): DocumentData => {
    return {
      categoryName: category.categoryName,
      shopRef: doc(collection(firebaseDb, `shops`), category.shopId),
      shopId: category.shopId
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Category => {
    const data = snapshot.data(options);
    return {
      categoryName: data.categoryName,
      categoryId: snapshot.id,
      shopId: data.shopRef.id
    };
  }
};

export const insertCategory = async (category: CategoryInput) => {
  const docRef = doc(
    collection(firebaseDb, 'category').withConverter(categoryConverter)
  );
  return setDoc(docRef, category);
};

export const getCategory = async (shopId: string): Promise<Array<Category>> => {
  const querySnapshot = collection(firebaseDb, 'category').withConverter(
    categoryConverter
  );
  const q = query(querySnapshot, where('shopId', '==', shopId));
  const res = await getDocs(q);
  return res.docs.map((doc) => doc.data());
};

export const useCategoryMutation = ({
  onSuccess
}: {
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation(
    (categoryInput: CategoryInput) => {
      return insertCategory(categoryInput);
    },
    {
      onSuccess: (_, categoryInput) => {
        queryClient.invalidateQueries(['categories', categoryInput.shopId]);
        onSuccess();
      }
    }
  );
};

export const useCategoryQuery = (shopId: string) => {
  return useQuery<Category[], Error>(
    ['categories', shopId],
    async () => {
      const category = await getCategory(shopId);
      return [
        {
          categoryId: '-1',
          categoryName: 'Suggestion',
          shopId: category[0].shopId
        },
        ...category
      ];
    },
    {
      enabled: !!shopId
    }
  );
};
