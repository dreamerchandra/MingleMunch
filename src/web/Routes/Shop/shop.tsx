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
        <OurStories  />
        <Box marginTop={2}>
          <Shops />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
