import { styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const Imag = styled('img')`
  mask-image: url(./slit.svg);
  mask-repeat: no-repeat;
  mask-size: contain;
  margin: auto;
  background-color: rgb(255 0 0);
  height: 307px;

  height: 151px;
  width: 231px;
  animation: rainbow_animation 6s ease-in-out infinite;
  background-size: 400% 100%;
  background: linear-gradient(
    to right,
    #6666ff,
    #0099ff,
    #00ff00,
    #ff3399,
    #6666ff
  );
  color: transparent !important;
  background-size: 400% 100%;
  display: block;
`;

const Center = styled('div')`
  display: block;
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
`;

export const Loading = () => {
  return (
    <div
      style={{
        height: '100dvh',
        background: 'black'
      }}
    >
      <Center>
        <Imag />
        <CircularProgress color="secondary" />
      </Center>
    </div>
  );
};

function SkeletonLoading() {
  return (
    <div
      style={{
        width: '80%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ margin: 1 }}>
          <Skeleton variant="circular">
            <Avatar />
          </Skeleton>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Skeleton width="100%">
            <Typography>.</Typography>
          </Skeleton>
        </Box>
      </Box>
      <Skeleton variant="rectangular" width="100%">
        <div style={{ paddingTop: '57%' }} />
      </Skeleton>
    </div>
  );
}

export const SkeletonLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        alignItems: 'center',
        gap: 1,
        pb: 16
      }}
    >
      <SkeletonLoading />
      <SkeletonLoading />
      <SkeletonLoading />
      <SkeletonLoading />
      <SkeletonLoading />
    </Box>
  );
};
