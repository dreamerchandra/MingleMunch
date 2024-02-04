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
      <Header title="Order History" />
      <Container
        component="main"
        sx={{
          height: 'calc(100dvh - 60px)',
          overflow: 'auto',
          p: 0
        }}
      >
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
