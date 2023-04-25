import { useQuery } from '@tanstack/react-query';
import { Order } from '../../../common/types/Order';
import { useUser } from '../../firebase/auth';
import { getOrderHistory } from '../../firebase/order';

export const useOrderHistoryQuery = () => {
  const {
    userDetails: { user }
  } = useUser();
  return useQuery<Order[]>(
    ['orderHistory'],
    async () => {
      if (user?.uid === undefined) throw new Error('User not logged in');
      return getOrderHistory(user?.uid);
    },
    { enabled: user?.uid !== undefined }
  );
};
