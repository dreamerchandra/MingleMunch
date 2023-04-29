import { Global } from '@emotion/react';
import { Badge, Fab, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useState } from 'react';
import { Checkout } from './Checkout';
import { useCart } from './cart-activity';
import { ShoppingCart } from '@mui/icons-material';

const drawerBleeding = 56;

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor:
    theme.palette.mode === 'light'
      ? grey[100]
      : theme.palette.background.default
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800]
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)'
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  zIndex: theme?.zIndex?.drawer + 1
}));

export function CheckoutHeadsUp() {
  const [open, setOpen] = useState(false);
  const { cartDetails } = useCart();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  if (cartDetails.cart.length === 0) return null;

  return (
    <>
      <StyledBadge
        badgeContent={cartDetails.cart.length}
        color="primary"
        aria-label="checkout"
      >
        <Fab
          color="primary"
          aria-label="checkout"
          onClick={toggleDrawer(!open)}
        >
          <ShoppingCart />
        </Fab>
      </StyledBadge>

      <Root>
        <Global
          styles={{
            '.MuiDrawer-root > .MuiPaper-root': {
              height: `calc(50% - ${drawerBleeding}px)`,
              overflow: 'visible'
            }
          }}
        />
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          swipeAreaWidth={drawerBleeding}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true
          }}
        >
          <StyledBox
            sx={{
              position: 'absolute',
              top: -drawerBleeding,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              visibility: 'visible',
              right: 0,
              left: 0
            }}
          >
            <Puller />
            <Checkout open={open} />
          </StyledBox>
        </SwipeableDrawer>
      </Root>
    </>
  );
}
