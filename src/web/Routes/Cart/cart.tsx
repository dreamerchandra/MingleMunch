import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { Checkout } from '../../module/Shoping/Checkout';

export const CartPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header />
      <Container component="main">
        <Box marginTop={2}>
          <Checkout />
        </Box>
      </Container>
    </>
  );
};
