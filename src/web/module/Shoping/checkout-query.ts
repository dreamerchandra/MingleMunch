import {
  UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  createHomeOrder,
  createOrder,
  getDeliveryFee,
  OrderPayload
} from '../../firebase/order';
import { Order } from '../../../common/types/Order';
import { Product } from '../../../common/types/Product';
import { useCart } from './cart-activity';

interface OrderError {
  error: string;
  message?: string;
  products?: Product[];
}

export const useMutationCreateOrder = (): UseMutationResult<
  Order & { paymentLink: string },
  { cause: OrderError },
  OrderPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useMutationHomeOrder = (): UseMutationResult<
  {
    success: boolean;
  },
  { cause: OrderError },
  {
    quantity: number;
    number: number;
    timeSlot: string;
    date: Date;
  }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHomeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useDeliveryFee = () => {
  const { cartDetails } = useCart();
  const details = cartDetails.cart.reduce((acc, item) => {
    const existing = acc.find((i) => i.itemId === item.itemId);
    if (existing) {
      existing.quantity += 1;
      return acc;
    }
    acc.push({ itemId: item.itemId, quantity: 1 });
    return acc;
  }, [] as { itemId: string; quantity: number }[]);

  return useQuery({
    queryKey: ['deliveryFee'],
    queryFn: () => {
      return getDeliveryFee({
        details
      });
    }
  });
};
