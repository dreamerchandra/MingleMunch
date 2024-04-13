import { ArrowDownward } from '@mui/icons-material';
import { Badge, Container, Fab, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Header } from '../../module/Header/header';
import { Checkout } from '../../module/Shoping/Checkout';

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: 'fixed',
  bottom: '64px',
  right: '16px',
  zIndex: theme?.zIndex?.drawer + 1
}));

const useTrackHeight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrackHeight(ref.current?.scrollHeight ?? 0);
    }, 1000);
    setTrackHeight(ref.current?.scrollHeight ?? 0);
    if (!show) {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [show]);

  return { ref, trackHeight, show, setShow };
};

export const CartPage = () => {
  const { ref, trackHeight, setShow, show } = useTrackHeight();
  return (
    <>
      <Header title="Checkout" />
      <Container
        component="main"
        ref={ref}
        sx={{
          backgroundColor: '#f1f1f1',
          p: 0,
          overflow: 'auto',
          height: 'calc(100dvh - 60px)',
          m: 'atuo'
        }}
      >
        <Checkout />
        {trackHeight > 900 && show && (
          <StyledBadge color="success" aria-label="checkout">
            <Fab
              aria-label="checkout"
              color="primary"
              size="small"
              variant="extended"
              disableFocusRipple
              onClick={() => {
                setShow(false);
                ref.current?.scrollBy({
                  top: ref.current?.scrollHeight,
                  behavior: 'smooth'
                });
              }}
              sx={{
                backgroundColor: '#5f9ea0',
                color: 'white',
                gap: 1,
                pr: 2
              }}
            >
              <ArrowDownward
                sx={{
                  color: 'white'
                }}
              />
              Order
            </Fab>
          </StyledBadge>
        )}
      </Container>
    </>
  );
};
