import ShoppingCart from '@mui/icons-material/ShoppingCartOutlined';
import { Badge, Box, Button, Fab, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import { initFCM } from '../../firebase/firebase/fcm';
import { useCart } from './cart-activity';
import { Notifications } from '@mui/icons-material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: 'fixed',
  bottom: '70px',
  right: '16px',
  zIndex: theme?.zIndex?.drawer + 1
}));

export function CheckoutHeadsUp() {
  const { cartDetails } = useCart();

  const navigate = useNavigate();
  if (cartDetails.cart.length === 0) return null;

  return (
    <>
      <StyledBadge color="success" aria-label="checkout">
        <Fab
          aria-label="checkout"
          size="large"
          variant="extended"
          onClick={() => {
            navigate('/cart');
          }}
          sx={{
            backgroundColor: '#5f9ea0',
            color: 'white',
            gap: 1,
          }}
        >
          <ShoppingCart
            sx={{
              color: 'white'
            }}
          />
          {cartDetails.cart.length}
        </Fab>
      </StyledBadge>
    </>
  );
}

export function NotificationInfo({ onClick }: { onClick: () => void }) {
  const { userDetails } = useUser();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        mt: 2,
        mb: 2,
        p: 3,
      }}
    >
      <Typography variant="h2" color="text.secondary">
        Get Notified
      </Typography>
      <Typography variant="body1" color="text.secondary">
        For instant updates on our limited deals and offers, tap on allow
        notification
      </Typography>
      <Button
        color="secondary"
        variant="contained"
        sx={{
          alignSelf: 'end',
          fontSize: '0.70rem',
          gap: 1,
        }}
        onClick={async () => {
          setTimeout(() => {
            onClick();
          }, 1000);
          await initFCM(userDetails.user?.uid);
        }}
      >
        <Notifications />
        Allow Notification
      </Button>
    </Box>
  );
}
