import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProductInput,
  ProductsQuery,
  getProduct,
  getProducts,
  insertProduct,
  updateProduct
} from '../../firebase/product';
import { getShops } from '../../firebase/shop';
import { Product } from '../../../common/types/Product';
import { useCallback } from 'react';

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
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('products')
      });
    }
  });
};


export const useStaleProductQuery = (query: { shopId: string }) => {
  const queryClient = useQueryClient();
  return useCallback((productId: string) => {
    const data = queryClient.getQueryData(['shop', query.shopId, 'products', '']) as Product[];
    return data?.find((product: Product) => product.itemId === productId);
  }, [query.shopId, queryClient]) 
}

export const useProductQuery = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      return getProduct(productId);
    }
  });
}