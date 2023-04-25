import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../../common/types/Order';
import { useUser } from '../../firebase/auth';
import {
  getIncomingOrder,
  getOrderHistory,
  updateOrderStatus
} from '../../firebase/order';

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

export const useQueryIncomingOrder = () => {
  const {
    userDetails: { role }
  } = useUser();
  return useQuery<Order[]>(
    ['orderHistory'],
    async () => {
      if (['admin', 'vendor'].includes(role)) return getIncomingOrder();
      throw new Error('User not logged in');
    },
    { enabled: ['admin', 'vendor'].includes(role) }
  );
};

export const useMutationOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      orderId,
      orderStatus
    }: {
      orderId: string;
      orderStatus: OrderStatus;
    }) => {
      return updateOrderStatus({ orderId, orderStatus });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
      }
    }
  );
};
