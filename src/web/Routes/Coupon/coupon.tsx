import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../module/Shoping/cart-activity';

export const Coupon = () => {
  const navigate = useNavigate();
  const { updateCoupon } = useCart();
  const param = useParams();
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    if (param.couponId) {
      updateCoupon(param.couponId);
    }
    const intervalId = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    const timerId = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [navigate, param.couponId, updateCoupon]);
  return (
    <Box
      sx={{
        width: 'min(100vw, 1000px)',
        margin: 'auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <CheckCircleIcon
        sx={{ color: 'green', fontSize: '50vw', marginRight: '10px' }}
      />
      <Typography variant="h3" color="green">
        Congrats! Your First Delivery is Free!
      </Typography>
      <Button
        variant="outlined"
        color="info"
        sx={{
          fontSize: '0.75rem',
          mt: 5
        }}
      >
        Back To Home {5 - timer}
      </Button>
    </Box>
  );
};
