import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import { reuploadToken } from '../../firebase/firebase/fcm';
import { Header } from '../../module/Header/header';
import { LastOrder } from '../../module/LastOrder/LastOrder';
import { Shops } from '../../module/Shop/shop-list';
import {
  CheckoutHeadsUp,
  NotificationInfo
} from '../../module/Shoping/CheckoutHeadup';
import { useAppConfig } from '../../module/appconfig';
import { Loading } from '../../module/loading';
import { OurStories } from '../../module/stories/stories';

export const ShopPage = () => {
  const { userDetails } = useUser();
  const loading = userDetails?.loading;
  const navigate = useNavigate();
  const { data: appConfig } = useAppConfig();
  const [notificationGranted, setNotification] = useState(
    Notification.permission === 'granted'
  );
  const isAdmin = ['admin', 'vendor'].includes(userDetails?.role) || false;
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
      <Container
        component="main"
        sx={{
          height: '95vh',
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
        <Carousel
          showThumbs={false}
          infiniteLoop
          interval={4500}
          autoPlay
          showStatus={false}
          showArrows={false}
        >
          {appConfig?.carousel
            .filter((c) => (isAdmin ? true : c.isPublished))
            .map((c) => (
              <div
                key={c.image}
                style={{
                  aspectRatio: '16/9'
                }}
                onClick={() => {
                  c.url && navigate(c.url);
                }}
              >
                <img
                  src={c.image}
                  style={{
                    objectFit: 'cover',
                    height: '100%',
                    borderRadius: '10px'
                  }}
                />
              </div>
            ))}
        </Carousel>
        <Box marginTop={1}>
          <Shops />
          <CheckoutHeadsUp />
          <LastOrder />
        </Box>
      </Container>
    </>
  );
};
