import Box from '@mui/material/Box';
import { useLastOrder } from './last-order';

export const LastOrder = () => {
  const lastOrder = useLastOrder();
  console.log(lastOrder)
  if (!lastOrder) return null;
  if (lastOrder?.status == 'delivered') return null;
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#d1ff0465',
        pt: 2,
        pb: 2
      }}
    >
      {lastOrder?.status == 'pending' && 'Waiting for hotel to accept your order'}
      {lastOrder?.status == 'ack_from_hotel' && 'Your order has been acknowledged by the hotel'}
      {lastOrder?.status == 'prepared' && 'Your order is on the way'}
    </Box>
  );
};
