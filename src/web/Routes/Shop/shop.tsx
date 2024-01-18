import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Shops } from '../../module/Shop/shop-list';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { OurStories } from '../../module/stories/stories';

export const ShopPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header Menu={SideMenu} />
      <Container component="main">
        <OurStories />
        <img
          style={{
            width: '90vw'
          }}
          alt='banner'
          src="https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/banner.png?alt=media&token=c52454d1-4154-417f-9f68-b876782895dc"
        />
        <Box marginTop={2}>
          <Shops />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
