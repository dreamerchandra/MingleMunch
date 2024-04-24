import { Box, Skeleton } from '@mui/material';
import { FC, useEffect, useState } from 'react';

export const NoticeBoard: FC = () => {
  const [src] = useState(
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/Drawing.png?alt=media&token=87a1dc33-966f-466d-af9b-34cdacade81a'
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
