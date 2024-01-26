import Box from '@mui/material/Box';
import { useLastOrder } from './last-order';
import Button from '@mui/material/Button';
import { useState } from 'react';

declare global {
  interface Window {
    installEvent: {
      prompt: () => void;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    } | null;
  }
}

export const AddToHomeScreen = () => {
  const [dismiss, setDismiss] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches;
  });
  if (dismiss) return null;
  return (
    <Button
      onClick={async () => {
        if (window.installEvent) {
          window.installEvent.prompt();
          await window.installEvent.userChoice;
          window.installEvent = null;
          setDismiss(true);
        }
      }}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#ff0404e2',
        pt: 2,
        pb: 2,
        color: 'white',
        borderRadius: 0
      }}
    >
      Add To Your Home Screen
    </Button>
  );
};

export const LastOrder = () => {
  const lastOrder = useLastOrder();
  if (!lastOrder) return <AddToHomeScreen />;
  if (lastOrder?.status == 'delivered') return <AddToHomeScreen />;
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
      {lastOrder?.status == 'pending' &&
        'Waiting for hotel to accept your order'}
      {lastOrder?.status == 'ack_from_hotel' &&
        'Your order has been acknowledged by the hotel'}
      {lastOrder?.status == 'prepared' && 'Your order is on the way'}
    </Box>
  );
};
