import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../firebase/product';

export const useProductQuery = () =>
  useQuery({ queryKey: ['products'], queryFn: getProducts });
