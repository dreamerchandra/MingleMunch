import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Checkout } from '../../module/Shoping/Checkout';

export const CartPage = () => {
  useProtectedRoute();
  return (
    <>
      <Header Menu={SideMenu} />
      <Container component="main">
        <Box marginTop={2}>
          <Checkout />
        </Box>
      </Container>
    </>
  );
};
