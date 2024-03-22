import { Box, Container } from '@mui/material';
import { useProtectedRoute, useUser } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { OrderHistory } from '../../module/OrderHistory/OrderHistory';
import { Suspense, lazy } from 'react';
import { SkeletonLoader } from '../../module/loading';

const IncomingOrder = lazy(() => import('../../module/OrderHistory/incoming-order').then((m) => ({ default: m.IncomingOrder })));
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
            <Suspense fallback={<SkeletonLoader />}>
              <IncomingOrder />
            </Suspense>
          ) : (
            <OrderHistory />
          )}
        </Box>
      </Container>
    </div>
  );
};
