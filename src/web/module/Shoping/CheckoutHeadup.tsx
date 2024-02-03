import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Badge, Box, Button, Fab, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import { initFCM } from '../../firebase/firebase/fcm';
import { useCart } from './cart-activity';

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: 'fixed',
  bottom: '58px',
  right: '16px',
  zIndex: theme?.zIndex?.drawer + 1
}));

export function CheckoutHeadsUp() {
  const { cartDetails } = useCart();

  const navigate = useNavigate();
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
          onClick={() => {
            navigate('/cart');
          }}
        >
          <ShoppingCart />
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
        mb: 2
      }}
    >
      <Typography variant="h3" sx={{ color: 'black' }}>
        Get Notified
      </Typography>
      <Typography variant="caption">
        For instant updates on our limited deals and offers, tap on allow
        notification
      </Typography>
      <Button
        color="error"
        variant="contained"
        sx={{
          alignSelf: 'end',
          fontSize: '0.70rem'
        }}
        onClick={async () => {
          setTimeout(() => {
            onClick();
          }, 1000);
          await initFCM(userDetails.user?.uid);
        }}
      >
        Allow Notification
      </Button>
    </Box>
  );
}
