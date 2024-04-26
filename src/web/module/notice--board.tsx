import { Box, Skeleton } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const NoticeBoard: FC = () => {
  const [src] = useState(
    'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/zawarma.png?alt=media&token=5e3a456d-7834-4f79-ba95-342ba78e1886'
  );
  const navigate = useNavigate();
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
        onClick={() => {
          navigate('/shop/BOmEbao75ZSfXusKIOhi');
        }}
      />
      {loading && (
        <Skeleton variant="rectangular" width="100%">
          <div style={{ paddingTop: '57%' }} />
        </Skeleton>
      )}
    </Box>
  );
};
