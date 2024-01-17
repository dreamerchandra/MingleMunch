import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { firebaseDb } from '../../firebase/firebase/db';
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { useCallback, useState } from 'react';

interface Story {
  title: string;
  content: string;
  isPublished: boolean;
  storyId: string;
  imageUrl: string;
  type: string;
}

const storyConverter = {
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Story => {
    const data = snapshot.data(options);
    return { ...data, storyId: snapshot.id } as Story;
  },
  toFirestore: (story: Story): DocumentData => {
    return { ...story, storyId: story.storyId };
  }
};

const getStories = async (): Promise<Story[]> => {
  const ref = query(
    collection(firebaseDb, 'stories').withConverter(storyConverter),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  );
  const queryStories = await getDocs(ref);
  const res = queryStories.docs.map((doc) => doc.data());
  return res;
};

export const useStoriesQuery = (
  options: UseQueryOptions<Story[], Error> = {}
) => {
  return useQuery<Story[], Error>(['stories'], () => getStories(), {
    ...options
  });
};

export const useWatchedStories = () => {
  const [watched, _setWatch] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem('watched') ?? '[]')
  );
  const setWatch = useCallback((storyId: string) => {
    _setWatch((prev) => {
      const newWatched = [...(new Set([...prev, storyId]))];
      localStorage.setItem(
        'watched',
        JSON.stringify(newWatched)
      );
      return newWatched;
    });
  }, []);
  return { watched, setWatch };
};
