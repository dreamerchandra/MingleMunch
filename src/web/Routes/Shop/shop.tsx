import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import {
  isNotificationSupported,
  reuploadToken
} from '../../firebase/firebase/fcm';
import { Header } from '../../module/Header/header';
import { LastOrder } from '../../module/LastOrder/LastOrder';
import { Shops } from '../../module/Shop/shop-list';
import {
  CheckoutHeadsUp,
  NotificationInfo
} from '../../module/Shoping/CheckoutHeadup';
import { HomeFoodBanner } from '../../module/home-food-banner';
import { HomeFoodDrawer } from '../../module/home-food-drawer';
import { Loading } from '../../module/loading';
import { OurStories } from '../../module/stories/stories';
import { FullPageBanner } from '../../module/full-page-banner';

export const ShopPage = () => {
  const { userDetails } = useUser();
  const loading = userDetails?.loading;
  const navigate = useNavigate();
  const [notificationGranted, setNotification] = useState(
    !isNotificationSupported() ? true : Notification.permission === 'granted'
  );
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    if (loading) {
      localStorage.setItem('splash', window.location.pathname);
      const timer = setTimeout(() => {
        navigate('/splash');
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);
  useEffect(() => {
    reuploadToken().then(() => {
      console.log('token uploaded');
    });
  }, []);
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Header title="Burn Home" />
      <FullPageBanner />
      <Container
        component="main"
        sx={{
          height: '90vh',
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {notificationGranted ? (
          <OurStories />
        ) : (
          <NotificationInfo onClick={() => setNotification(true)} />
        )}
        <div
          style={{
            height: '10px'
          }}
        ></div>
        <HomeFoodBanner
          onClick={() => {
            setDrawer(true);
          }}
        />
        <Box marginTop={1}>
          <Shops />
          <CheckoutHeadsUp />
          <LastOrder />
        </Box>
        <HomeFoodDrawer open={drawer} setOpen={setDrawer} />
      </Container>
    </>
  );
};
