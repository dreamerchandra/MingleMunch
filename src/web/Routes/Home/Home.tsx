import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Products } from '../../module/Products/Products';
import { CartProvider } from '../../module/Shoping/cart-activity';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { AddProducts } from '../../module/Products/add-proudct';
import { useState } from 'react';

export const HomePage = () => {
  useProtectedRoute();
  const [search, onSearch] = useState('');
  return (
    <CartProvider>
      <Header Menu={SideMenu} onSearch={onSearch} />
      <Container component="main">
        <Box marginTop={2}>
          <AddProducts />
          <Products search={search} />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </CartProvider>
  );
};
