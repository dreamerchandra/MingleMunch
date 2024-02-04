import { CircularProgress, styled } from '@mui/material';

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
