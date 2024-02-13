import { getLastOrder } from '../../firebase/order';
import { useUser } from '../../firebase/auth';
import { useEffect, useState } from 'react';
import { Order } from '../../../common/types/Order';
import { Unsubscribe } from 'firebase/firestore';

export const useLastOrder = () => {
  const {
    userDetails: { user }
  } = useUser();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    let unsub: Unsubscribe | null = null;
    const handleOrderChange = (order: Order) => {
      setLastOrder(order);
    };
    const updateLastOrder = async () => {
      const { order, unsubscribe } = await getLastOrder(
        user.uid,
        handleOrderChange,
        handleOrderChange
      );
      unsub = unsubscribe;
      setLastOrder(order);
    };
    updateLastOrder();
    return () => {
      unsub?.();
    };
  }, [user]);

  return lastOrder;
};
