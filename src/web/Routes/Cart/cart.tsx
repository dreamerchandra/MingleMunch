import { Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { Checkout } from '../../module/Shoping/Checkout';

export const CartPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header title="Checkout" />
      <Container
        component="main"
        sx={{
          backgroundColor: 'transparent'
        }}
      >
        <Checkout />
      </Container>
    </>
  );
};
