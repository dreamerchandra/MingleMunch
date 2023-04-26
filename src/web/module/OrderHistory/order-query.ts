import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../../common/types/Order';
import { useUser } from '../../firebase/auth';
import {
  incomingOrderSocketUupdate as incomingOrderSocketUpdate,
  getOrderHistory,
  updateOrderStatus
} from '../../firebase/order';
import { useEffect, useState } from 'react';

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
  const [oder, setOrder] = useState<{ orders: Order[]; loading: boolean }>({
    loading: true,
    orders: []
  });
  useEffect(() => {
    const onAdded = (order: Order) => {
      setOrder((prev) => ({
        loading: false,
        orders: [order, ...prev.orders]
      }));
    };
    const onChange = (order: Order) => {
      setOrder((prev) => {
        const orderIndex = prev.orders.findIndex(
          (o) => o.orderId === order.orderId
        );
        console.log(orderIndex);
        const isNewlyAdded = orderIndex === -1;
        if (isNewlyAdded) {
          return prev;
        }
        const newOrders = [...prev.orders];
        newOrders[orderIndex] = order;
        return {
          loading: false,
          orders: newOrders
        };
      });
    };

    const getLiveOrders = async () => {
      const orders = await incomingOrderSocketUpdate(onAdded, onChange);
      setOrder({ loading: false, orders });
    };
    if (['admin', 'vendor'].includes(role)) {
      getLiveOrders();
    }
  }, [role]);

  return { loading: oder.loading, orders: oder.orders };
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
