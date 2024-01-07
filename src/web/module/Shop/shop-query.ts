import { useQuery } from "@tanstack/react-query";
import { getShops } from "../../firebase/shop";

export const useShopQuery = (
  ) =>
    useQuery({
      queryKey: ['shop'],
      queryFn: () => getShops(),
    });