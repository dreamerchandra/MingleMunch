import { Box, Button } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useUser } from '../firebase/auth';

export const HomeFoodBanner: FC<{ onClick: () => void }> = ({ onClick }) => {
  const {
    userDetails: { user }
  } = useUser();
  const [src, setSrc] = useState(
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/chicken_cukka%2Fchicken_chukka_720.png?alt=media&token=49d58a2a-e485-4788-a360-8a234b746409'
  );
  useEffect(() => {
    fetch(
      'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/chicken_cukka%2Fchicken_chukka_720.png?alt=media&token=49d58a2a-e485-4788-a360-8a234b746409'
    )
      .then((res) => {
        return res.blob();
      })
      .then((blob) => {
        setSrc(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.log(err);
      });
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
        src={src}
      />
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
    </Box>
  );
};
