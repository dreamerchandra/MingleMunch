import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import '../Shop/shop-query';
import '../appconfig';
import { Loading } from '../loading';
import { getShops } from '../../firebase/shop';
import { getAppConfig } from '../appconfig';

export const Splash = () => {
  const { userDetails } = useUser();
  const queryClient = useQueryClient();
  const userId = userDetails.user?.uid;
  const loading = userDetails.loading;
  const navigator = useNavigate();
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['shops'],
      queryFn: getShops,
    })
    queryClient.prefetchQuery({
      queryKey: ['appConfig'],
      queryFn: getAppConfig
    })
    if (loading) return;
    const timerId = setTimeout(() => {
      const location = localStorage.getItem('splash') || '/';
      navigator(location, {
        replace: true
      });
    }, 1000);
    return () => clearTimeout(timerId);
  }, [loading, navigator, queryClient, userId]);
  return (
    <Loading />
  );
};
