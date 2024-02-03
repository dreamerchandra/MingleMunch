import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { Checkout } from '../../module/Shoping/Checkout';

export const CartPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header />
      <Container
        component="main"
        sx={{
          height: 'calc(100vh - 60px)',
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Box marginTop={2}>
          <Checkout />
        </Box>
      </Container>
    </>
  );
};
