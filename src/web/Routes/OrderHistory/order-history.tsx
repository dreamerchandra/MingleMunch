import { Box, Container } from '@mui/material';
import { useProtectedRoute, useUser } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { OrderHistory } from '../../module/OrderHistory/OrderHistory';
import { IncomingOrder } from '../../module/OrderHistory/incoming-order';

export const OrderHistoryRoute = () => {
  useProtectedRoute();
  const {
    userDetails: { role }
  } = useUser();
  return (
    <div>
      <Header />
      <Container component="main">
        <Box marginTop={2}>
          {['admin', 'vendor'].includes(role) ? (
            <IncomingOrder />
          ) : (
            <OrderHistory />
          )}
        </Box>
      </Container>
    </div>
  );
};
