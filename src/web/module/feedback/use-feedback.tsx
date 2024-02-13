import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useUser } from '../../firebase/auth';
import { firebaseDb } from '../../firebase/firebase/db';

interface Feedback {
  id: string;
  rating: {
    date: string;
    rating: number;
    orderId: string;
  }[];
}

const getNpsSore = async (
  userId: string
): Promise<Feedback['rating'] | undefined> => {
  const snap = await getDoc(doc(firebaseDb, `nps/${userId}`));
  const data = snap.data() as Feedback;
  return data?.rating;
};

const setNpsScore = async (
  userId: string,
  rating: { rating: number; orderId: string; suggestion: string }
) => {
  const snap = await getDoc(doc(firebaseDb, `nps/${userId}`));
  const data = snap.data() as Feedback;
  const rate = data?.rating ?? [];
  const _rating = {
    date: new Date().toString(),
    ...rating
  };
  const newRating: Feedback['rating'] = [...rate, _rating];
  await setDoc(doc(firebaseDb, `nps/${userId}`), {
    rating: newRating
  });
};

export const useFeedback = () => {
  const user = useUser();
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => {
      return getNpsSore(user.userDetails.user!.uid);
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30000,
    enabled: !!user.userDetails.user
  });
};

export const useFeedbackMutation = () => {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation(
    (param: { rating: number; orderId: string; suggestion: string }) => {
      return setNpsScore(user.userDetails.user!.uid, param);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feedback']);
      }
    }
  );
};
