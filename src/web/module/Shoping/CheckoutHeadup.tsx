import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Badge, Fab, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from './cart-activity';

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: 'fixed',
  bottom: '16px',
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
