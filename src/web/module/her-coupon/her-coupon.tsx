import { Box, Skeleton } from '@mui/material';
import { useState } from 'react';
import { useHerCouponQuery } from './her-coupon-query';
import { useUser } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import copy from 'copy-to-clipboard';

export const HerCoupon = () => {
  const [loading, setLoading] = useState(true);
  const src =
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/her_coupon.png?alt=media&token=b033a1f5-71b2-4c74-899a-cafc24a091fc';
  const { data } = useHerCouponQuery();
  const {
    userDetails: { user }
  } = useUser();
  const navigate = useNavigate();
  const onClick = () => {
    if (!user) {
      toast.dark('Please login to use get your coupon');
      navigate('/login');
      return;
    }
    if (data?.coupon) {
      const next5Days = new Date();
      next5Days.setDate(next5Days.getDate() + 5);
      toast.dark('Copied to clipboard!');
      const text = `🍔🍔 Craving something delicious? 🍕\n
      Order now from GoBurn and enjoy free delivery \n https://delivery.goburn.in/coupon/${
        data.coupon
      } \n
      Valid till: ${next5Days.toDateString()} \n`;
      copy(text);
      navigator.share?.({
        text
      });
    }
  };
  return (
    <Box
      sx={{
        width: 'min(100vw, 1000px)',
        margin: 'auto',
        minHeight: '190px',
        display: !loading ? 'flex' : '',
        alignItems: 'end',
        background: !loading ? '#004aad' : ''
      }}
      onClick={onClick}
    >
      <img
        style={{
          width: '100%',
          objectFit: 'cover',
          zIndex: 10
        }}
        onLoad={() => {
          setLoading(false);
        }}
        src={src}
      />
      {loading && (
        <Skeleton variant="rectangular" width="100%">
          <div style={{ paddingTop: '57%' }} />
        </Skeleton>
      )}
    </Box>
  );
};
