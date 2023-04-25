import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts, updateProduct } from '../firebase/product';
export const useProductQuery = () =>
  useQuery({ queryKey: ['products'], queryFn: getProducts });

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};
