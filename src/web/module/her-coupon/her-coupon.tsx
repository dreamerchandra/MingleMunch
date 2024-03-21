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
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/her_coupon_banner.jpeg?alt=media&token=5e0e5bdc-5075-4c34-a4c6-ee0f1c5cab13';
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
      copy(`🍔 Craving something delicious? 🍕\n
      Order now from Go Burn at goburn.in and enjoy free delivery with code \n ${data.coupon}!`);
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
