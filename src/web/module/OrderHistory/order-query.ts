import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Unsubscribe } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Order, OrderStatus } from '../../../common/types/Order';
import { useUser } from '../../firebase/auth';
import {
  getOrderHistoryWithRealTimeUpdate,
  incomingOrderSocketUupdate as incomingOrderSocketUpdate,
  incomingOrderSocketUupdateForDelivery,
  updateAssigneeForOrder,
  updateOrderStatus
} from '../../firebase/order';
import { updateDistributorAmount } from './distributor';

const onAddedUtil = (thisOrder: Order, oldOrders: Order[]): Order[] => {
  if (oldOrders.find((order) => order.orderId === thisOrder.orderId))
    return oldOrders;
  return [thisOrder, ...oldOrders];
};
const onChangeUtil = (order: Order, preOrders: Order[]): Order[] => {
  console.log('change');
  const orderIndex = preOrders.findIndex((o) => o.orderId === order.orderId);
  console.log(orderIndex);
  const isNewlyAdded = orderIndex === -1;
  if (isNewlyAdded) {
    return preOrders;
  }
  const newOrders = [...preOrders];
  newOrders[orderIndex] = order;
  return newOrders;
};

export const useOrderHistoryQuery = () => {
  const {
    userDetails: { user, role, loading }
  } = useUser();
  const [oder, setOrder] = useState<{ orders: Order[]; loading: boolean }>({
    loading: true,
    orders: []
  });
  const [newlyAdded, setNewlyAdded] = useState<string[]>([]);
  const userId = user?.uid;
  const unsubscribeRef = useRef<Unsubscribe[]>([]);
  useEffect(() => {
    if (loading) return;
    if (!userId) return;
    const onAdded = (newOrder: Order) => {
      console.log('onAdded');
      if (newOrder.shopOrderValue == undefined) {
        setNewlyAdded((prev) => [...new Set([...prev, newOrder.orderId])]);
      } else {
        setOrder((prev) => {
          const newState = onAddedUtil(newOrder, prev.orders);
          return {
            loading: false,
            orders: newState
          };
        });
      }
    };
    const onChange = (changedOrder: Order) => {
      console.log('onChange');
      setOrder((prev) => {
        const newState = onChangeUtil(changedOrder, prev.orders);
        return {
          loading: false,
          orders: newState
        };
      });
    };

    const getLiveOrders = async () => {
      console.log('getLiveOrders');
      if (['admin', 'vendor'].includes(role)) {
        const { orders, unsubscribe: _unsub } = await incomingOrderSocketUpdate(
          onAdded,
          onChange
        );
        unsubscribeRef.current?.push(_unsub);
        setOrder({ loading: false, orders });
      } else if (['delivery', 'distributor'].includes(role)) {
        const { orders, unsubscribe: _unsub } =
          await incomingOrderSocketUupdateForDelivery(
            onAdded,
            onChange,
            userId
          );
        unsubscribeRef.current?.push(_unsub);
        setOrder({ loading: false, orders });
      } else {
        const { unsubscribe: _unsub, orders } =
          await getOrderHistoryWithRealTimeUpdate(userId, {
            onAdded,
            onChange
          });
        unsubscribeRef.current?.push(_unsub);
        setOrder({ loading: false, orders });
      }
    };
    getLiveOrders();
    const unsubscribe = unsubscribeRef.current;
    return () => {
      unsubscribe?.forEach((unsub) => unsub());
    };
  }, [loading, role, userId]);

  return { loading: oder.loading, orders: oder.orders, newlyAdded };
};

export const useMutationOrderStatus = () => {
  const queryClient = useQueryClient();
  const {
    userDetails: { user, role }
  } = useUser();
  return useMutation(
    async (param: {
      orderId: string;
      orderStatus: OrderStatus;
      time: Date;
      delayReason: string[];
      orderAmount: number;
    }) => {
      if (role === 'distributor' && param.orderStatus === 'delivered') {
        await updateDistributorAmount({
          userId: user!.uid,
          amount: param.orderAmount
        });
      }
      return updateOrderStatus({ ...param, userId: user!.uid });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
        queryClient.invalidateQueries({ queryKey: ['distributor-payment'] });
      }
    }
  );
};

export const useMutationOrderAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (param: {
      orderId: string;
      assignedTo: string[];
      paymentCollector: string;
      paymentCollectorName: string;
      assigneeName: string;
    }) => {
      return updateAssigneeForOrder(param);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
      }
    }
  );
};
