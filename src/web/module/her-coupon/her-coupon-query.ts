import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../firebase/auth';
import { get } from '../../firebase/fetch';

const getHerCoupon = async () => {
  const data = await get('/v1/her-coupon');
  return data as { coupon: string };
};

export const useHerCouponQuery = () => {
  const { userDetails } = useUser();
  const myId = userDetails?.user?.uid;
  return useQuery({
    queryKey: ['her-coupon'],
    queryFn: () => {
      return getHerCoupon();
    },
    enabled: !!myId
  });
};
