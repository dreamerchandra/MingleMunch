import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Products } from '../../module/Shoping/Products';
import { CartProvider } from '../../module/Shoping/cart-activity';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';

export const Vendor = () => {
  useProtectedRoute();
  return (
    <CartProvider>
      <Header Menu={SideMenu} />
      <Container component="main">
        <Box marginTop={2}>
          <Products />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </CartProvider>
  );
};
