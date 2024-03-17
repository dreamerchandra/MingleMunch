import { Box, Button, Skeleton } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useUser } from '../firebase/auth';

export const HomeFoodBanner: FC<{ onClick: () => void }> = ({ onClick }) => {
  const {
    userDetails: { user }
  } = useUser();
  const [src] = useState(
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/chicken_cukka%2Fchicken_chukka_720.png?alt=media&token=49d58a2a-e485-4788-a360-8a234b746409'
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timerId);
  }, []);
  return (
    <Box
      sx={{
        width: 'min(100vw, 1000px)',
        margin: 'auto',
        position: 'relative'
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
      {!loading && (
        <Button
          color="secondary"
          variant="contained"
          sx={{
            position: 'absolute',
            top: '8px',
            right: '1%'
          }}
        >
          {user ? 'Order Now' : 'Login to Order'}
        </Button>
      )}
    </Box>
  );
};
