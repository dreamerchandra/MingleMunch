import { Box, Button } from '@mui/material';
import { FC } from 'react';
import { useUser } from '../firebase/auth';

export const HomeFoodBanner: FC<{ onClick: () => void }> = ({ onClick }) => {
  const {
    userDetails: { user }
  } = useUser();
  return (
    <Box
      sx={{
        width: 'min(92vw, 1000px)',
        margin: 'auto',
        position: 'relative'
      }}
      onClick={onClick}
    >
      <img
        style={{
          width: '100%',
          objectFit: 'cover'
        }}
        src="https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/Frame%203%20(6)%20(1).png?alt=media&token=41018dc6-1c57-496a-b554-257c1be7c4e3"
      />
      <Button
        color="secondary"
        variant="contained"
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%'
        }}
      >
        {user ? 'Order Now' : 'Login to Order'}
      </Button>
    </Box>
  );
};
