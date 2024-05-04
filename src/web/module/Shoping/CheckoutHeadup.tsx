import { Notifications } from '@mui/icons-material';
import ShoppingCart from '@mui/icons-material/ShoppingCartOutlined';
import {
  Badge,
  Box,
  Button,
  Fab,
  Typography,
  styled
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import { initFCM } from '../../firebase/firebase/fcm';
import { useShopQuery } from '../Shop/shop-query';
import { useCart } from './cart-activity';

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
            gap: 1
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

const TextForCheckout: FC<{
  transition: boolean;
  addMore: number;
}> = ({ transition, addMore }) => {
  if (transition) {
    return (
      <Typography
        color="white"
        variant="button"
        className="rainbow_text_animated"
        fontWeight={900}
      >
        You got a free Delivery
      </Typography>
    );
  }
  if (addMore > 0) {
    return (
      <Typography color="white" variant="button" fontWeight={900}>
        Add Rs. {addMore} For Free Delivery
      </Typography>
    );
  }
  return (
    <Typography color="white" variant="button" fontWeight={900}>
      Proceed to cart
    </Typography>
  );
};

export function CheckoutHeadsUpInShop({ shopId }: { shopId: string }) {
  const { cartDetails } = useCart();

  const navigate = useNavigate();
  const totalByShopId = cartDetails.cart.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = 0;
    acc[item.shopId] += item.itemPrice;
    return acc;
  }, {} as Record<string, number>);
  const { data: shops } = useShopQuery();
  const shop = shops?.find((s) => s.shopId === shopId);
  const total = totalByShopId[shopId] || 0;
  const isFreeDelivery = total >= (shop?.minOrderValue ?? 0) || false;
  const addMore = shop?.minOrderValue ? shop.minOrderValue - total : 0;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (isFreeDelivery && shop?.minOrderValue) {
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, 3000);
    }
  }, [isFreeDelivery, shop?.minOrderValue]);

  if (cartDetails.cart.length === 0) return null;

  return (
    <Button
      variant="contained"
      sx={{
        p: 2,
        borderRadius: '0px',
        gap: 2,
        bgcolor: !isFreeDelivery ? '#82c34f' : '#4fc370',
        background: show
          ? `linear-gradient( rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85) ), url('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExejh4djRwbzkxNHBwcWZnbHFwdHZueG5yYTd6bWczMDNlaHZzM3ZidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5jT0jaNDsM6Ik7X9yq/giphy.gif')`
          : ''
      }}
      onClick={() => {
        navigate('/cart');
      }}
    >
      <TextForCheckout addMore={addMore} transition={show} />
      <ShoppingCart
        sx={{
          color: 'white'
        }}
      />
    </Button>
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
        p: 3
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
          gap: 1
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
