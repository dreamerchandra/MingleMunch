import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { OrderHistory } from '../../module/OrderHistory/OrderHistory';

export const OrderHistoryRoute = () => {
  useProtectedRoute();
  return (
    <div>
      <Header Menu={SideMenu} />
      <Container component="main">
        <Box marginTop={2}>
          <OrderHistory />
        </Box>
      </Container>
    </div>
  );
};
