import { Box, Container } from '@mui/material';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Shops } from '../../module/Shop/shop-list';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { OurStories } from '../../module/stories/stories';
import { LastOrder } from '../../module/LastOrder/LastOrder';
import { useEffect } from 'react';
import { useUser } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';

export const ShopPage = () => {
  const { userDetails } = useUser();
  const loading = userDetails?.loading;
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) {
      localStorage.setItem('splash', window.location.pathname);
      const timer = setTimeout(() => {
        navigate('/splash');
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);
  return (
    <>
      <Header Menu={SideMenu} />
      <Container component="main">
        <OurStories />
        <img
          style={{
            width: 'min(90vw, 900px)'
          }}
          alt="banner"
          src="https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/banner.png?alt=media&token=c52454d1-4154-417f-9f68-b876782895dc"
        />
        <Box marginTop={2}>
          <Shops />
          <CheckoutHeadsUp />
          <LastOrder />
        </Box>
      </Container>
    </>
  );
};
