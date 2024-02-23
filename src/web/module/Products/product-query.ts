import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../firebase/auth';
import {
  ProductInput,
  ProductsQuery,
  getProduct,
  getProducts,
  insertProduct,
  updateAvailability,
} from '../../firebase/product';
import { getShops } from '../../firebase/shop';

export const useProductsQuery = (
  params: ProductsQuery & { isEnabled: boolean; shopId: string }
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
    mutationFn: updateAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('products')
      });
    }
  });
};

export const useProductQuery = (productId: string) => {
  const { userDetails } = useUser();
  const isAdmin = userDetails?.role === 'admin';
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      return getProduct(productId, { isAdmin });
    }
  });
};
