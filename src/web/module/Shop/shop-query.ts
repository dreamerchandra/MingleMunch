import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getShops } from '../../firebase/shop';
import { firebaseDb } from '../../firebase/firebase/db';
import { doc, updateDoc } from 'firebase/firestore';

export const useShopQuery = () =>
  useQuery({
    queryKey: ['shops'],
    queryFn: () => getShops()
  });

interface ShopStatus {
  open: boolean;
  closeReason: string;
  shopId: string;
}

const updateShopStatus = async (status: ShopStatus) => {
  await updateDoc(doc(firebaseDb, 'shop', status.shopId), {
    isOpen: status.open,
    closeReason: status.closeReason
  });
};

export const useShopMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: ShopStatus) => {
      return await updateShopStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shops']);
    }
  });
};
