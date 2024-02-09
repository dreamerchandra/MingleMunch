import {
  UseMutationResult,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { createHomeOrder, createOrder, OrderPayload } from '../../firebase/order';
import { Order } from '../../../common/types/Order';
import { Product } from '../../../common/types/Product';

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
