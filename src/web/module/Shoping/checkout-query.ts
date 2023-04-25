import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../firebase/order';

export const useMutationCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};
