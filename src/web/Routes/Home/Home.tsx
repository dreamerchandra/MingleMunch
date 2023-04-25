import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Products } from '../../module/Products/Products';
import { CartProvider } from '../../module/Shoping/cart-activity';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { AddProducts } from '../../module/Products/add-proudct';

export const HomePage = () => {
  useProtectedRoute();
  return (
    <CartProvider>
      <Header Menu={SideMenu} />
      <Container component="main">
        <Box marginTop={2}>
          <AddProducts />
          <Products />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </CartProvider>
  );
};
