import { Box, Container } from '@mui/material';
import { useProtectedRoute, useUser } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
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

const DistributorIncomingOrder = lazy(() =>
  import('../../module/OrderHistory/distributor-order').then((m) => ({
    default: m.IncomingOrder
  }))
);

const OrderHistory = lazy(() =>
  import('../../module/OrderHistory/OrderHistory').then((m) => ({
    default: m.OrderHistory
  }))
);

export const OrderHistoryRoute = () => {
  useProtectedRoute();
  const {
    userDetails: { role }
  } = useUser();
  console.log({role})
  let Component = OrderHistory;
  if (role === 'admin') {
    Component = IncomingOrder;
  } else if (role === 'delivery') {
    Component = DeliveryIncomingOrder;
  } else if (role === 'distributor') {
    Component = DistributorIncomingOrder;
  }
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
          <Suspense fallback={<SkeletonLoader />}>
            <Component />
          </Suspense>
        </Box>
      </Container>
    </div>
  );
};
