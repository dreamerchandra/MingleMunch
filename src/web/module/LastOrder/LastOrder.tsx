import { Phone } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC, useEffect, useState } from 'react';
import { Analytics } from '../../../common/analytics';
import { useLastOrder } from './last-order';

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
          Analytics.pushEvent('prompt-to-homescreen');
          const install = await window.installEvent.userChoice;
          Analytics.pushEvent('added-to-homescreen', {
            install: install.outcome
          });
          window.installEvent = null;
          setDismiss(true);
        }
      }}
      sx={{
        position: 'fixed',
        bottom: 58,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // width: '100%',
        backgroundColor: '#ff0404e2',
        pt: 2,
        pb: 2,
        color: 'white',
        borderRadius: 0,
        width: 'min(100vw, 1200px)',
        left: {
          xs: 0,
          sm: 0,
          lg: 'calc(50% - 600px)',
        }
      }}
    >
      Add To Your Home Screen
    </Button>
  );
};

const Text: FC<{ label: string }> = ({ label }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timerId = setInterval(() => {
      setIdx((i) => (i + 1) % 2);
    }, 2000);
    return () => clearInterval(timerId);
  }, []);
  if (idx == 0)
    return (
      <>
        <Phone />
        {label}
      </>
    );
  return (
    <>
      <Phone />
      Taking longer : ) Call Us
    </>
  );
};

export const LastOrder: FC = () => {
  const lastOrder = useLastOrder();
  if (!lastOrder) return <AddToHomeScreen />;
  if (lastOrder?.status == 'delivered') return <AddToHomeScreen />;
  if (lastOrder?.status == 'rejected') return <AddToHomeScreen />;
  return (
    <Button
      sx={{
        position: 'fixed',
        bottom: 58,
        left: {
          xs: 0,
          sm: 0,
          lg: 'calc(50% - 600px)',
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d1ff0465',
        pt: 2,
        pb: 2,
        gap: 2,
        width: 'min(100vw, 1200px)',
      }}
      href="tel:+918220080109"
    >
      {lastOrder?.status == 'pending' && <Text label="Pending At Hotel" />}
      {lastOrder?.status == 'ack_from_hotel' && (
        <Text label="Acknowledged by the hotel" />
      )}
      {lastOrder?.status == 'prepared' && (
        <Text label="Your order is on the way" />
      )}
    </Button>
  );
};
