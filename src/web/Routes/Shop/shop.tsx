import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Shops } from '../../module/Shop/shop-list';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';

export const ShopPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header Menu={SideMenu}  />
      <Container component="main">
        <Box marginTop={2}>
          <Shops  />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
