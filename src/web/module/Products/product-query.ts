import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProductInput,
  ProductQuery,
  getProducts,
  insertProduct,
  updateProduct
} from '../../firebase/product';
import { getShops } from '../../firebase/shop';
export const useProductQuery = (
  params: ProductQuery & { isEnabled: boolean; shopId: string }
) =>
  useQuery({
    queryKey: ['shop', params.shopId, 'products', params.search],
    queryFn: () => getProducts(params),
    enabled: params.isEnabled
  });

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const shops = await getShops();
      const shop = shops?.find((shop) => shop.shopId === product.shopId);
      return insertProduct(product, shop!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('products')
      });
    }
  });
};

export const useMutationProductEdit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('products')
      });
    }
  });
};
