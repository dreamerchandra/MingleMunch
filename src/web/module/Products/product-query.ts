import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProductQuery,
  getProducts,
  insertProduct,
  updateProduct
} from '../../firebase/product';
export const useProductQuery = (
  params: ProductQuery & { isEnabled: boolean }
) =>
  useQuery({
    queryKey: ['products', params.search],
    queryFn: () => getProducts(params),
    enabled: params.isEnabled
  });

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insertProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useMutationProductEdit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};
