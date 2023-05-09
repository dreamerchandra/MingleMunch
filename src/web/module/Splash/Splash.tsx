import Container from '@mui/material/Container';
import BrandIcon from '../../../asserts/logo.png';
import Face1 from './face1.png';
import Face2 from './face2.png';
import { Button, Typography, styled } from '@mui/material';

const Circle = styled('div')`
  width: 73px;
  height: 73px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 45px;
    height: 45px;
  }
`;

const FaceWrapper = styled('div')(
  ({ theme }) => `
  position: relative;
  width: min(100vw, ${theme.breakpoints.values.sm}px);
  height: 460px;
  div.img-wrapper {
    position: absolute;
    height: 100%;
    top: 0;
    left: -45px;
    z-index: 10;
  }
  div.img-wrapper2 {
    position: absolute;
    width: 225.4px;
    height: 298.54px;
    top: 0;
    right: 0;
  }
  img {
    height: 100%;
    &.face1 {
      transform: rotate(-3.1deg);
    }
    &.face2 {
      transform: rotate(8.57deg);
      width: 225.4px;
      height: 298.54px;
    }
  }
`
);

const FaceImgFilter = styled('div')`
  position: absolute;
  width: 150%;
  height: 50%;
  bottom: -40px;
  right: -15px;
  &.filter1 {
    background: linear-gradient(
      180deg,
      rgba(255, 71, 11, 0.1) -40.06%,
      #ff470b 75.85%
    );
    filter: blur(15px);
  }
  &.filter2 {
    background: linear-gradient(
      169.36deg,
      rgba(255, 71, 11, 0.51) -194.92%,
      #ff470b 92.09%
    );
    filter: blur(20px);
  }
`;

const ButtonWrapper = styled('div')(
  ({ theme }) => `
  position: absolute;
  bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  z-index: ${theme.zIndex.fab};
`
);

export const Splash = () => {
  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        backgroundColor: 'secondary.main',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '56px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Circle>
        <img src={BrandIcon} alt="logo" />
      </Circle>
      <Typography variant="h1" sx={{ color: '#fff', ml: 2 }}>
        Food for Everyone
      </Typography>
      <FaceWrapper>
        <div className="img-wrapper">
          <img src={Face1} alt="face1" className="face1" />
          <FaceImgFilter className="filter1" />
        </div>
        <div className="img-wrapper2">
          <img src={Face2} alt="face2" className="face2" />
          <FaceImgFilter className="filter2" />
        </div>
      </FaceWrapper>
      <ButtonWrapper>
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'common.white',
            color: 'secondary.main',
            '&:hover': {
              backgroundColor: 'common.white'
            }
          }}
          href="/login"
        >
          Get Stated
        </Button>
      </ButtonWrapper>
    </Container>
  );
};
