import { Box, Container } from '@mui/material';
import { useProtectedRoute, useUser } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { OrderHistory } from '../../module/OrderHistory/OrderHistory';
import { Suspense, lazy } from 'react';
import { SkeletonLoader } from '../../module/loading';

const IncomingOrder = lazy(() =>
  import('../../module/OrderHistory/incoming-order').then((m) => ({
    default: m.IncomingOrder
  }))
);

const DeliveryIncomingOrder = lazy(() =>
  import('../../module/OrderHistory/delivery-order').then((m) => ({
    default: m.IncomingOrder
  }))
);

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
          {role === 'admin' ? (
            <Suspense fallback={<SkeletonLoader />}>
              <IncomingOrder />
            </Suspense>
          ) : role === 'delivery' ? (
            <Suspense fallback={<SkeletonLoader />}>
              <DeliveryIncomingOrder />
            </Suspense>
          ) : (
            <OrderHistory />
          )}
        </Box>
      </Container>
    </div>
  );
};
