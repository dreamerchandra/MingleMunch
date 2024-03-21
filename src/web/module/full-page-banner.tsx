import { Close } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { Center, FullScreen } from './full-screen';
import { useNavigate } from 'react-router-dom';

const getFullPageBannerShown = (): Record<string, boolean> => {
  const fullPage = window.localStorage.getItem('fullPage');
  if (fullPage) {
    const details = JSON.parse(fullPage);
    return details;
  }
  return {};
};
const banner =
  'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/her_coupon_poster.jpeg?alt=media&token=806fae14-817a-4340-afed-e2ce162caa8f';

export const FullPageBanner = () => {
  const [hasShown, _setHasShown] = useState(() => {
    const details = getFullPageBannerShown();
    return details[banner];
  });
  const navigate = useNavigate();
  if (hasShown) {
    return null;
  }
  const setShown = () => {
    _setHasShown(true);

    const details = getFullPageBannerShown();
    window.localStorage.setItem(
      'fullPage',
      JSON.stringify({
        ...details,
        [banner]: true
      })
    );
  };
  return (
    <FullScreen>
      <Button
        sx={{
          position: 'fixed',
          top: '14vh',
          right: '20px',
          zIndex: 10000000,
          borderRadius: '50%',
          height: '56px',
          width: '50px'
        }}
        color="error"
        variant="text"
        onClick={setShown}
      >
        <Close fontSize="large" />
      </Button>
      <Center>
        <img
          src={banner}
          style={{
            height: '75vh',
            width: '95vw',
            objectFit: 'contain'
          }}
          onClick={() => {
            setShown();
            navigate('/shop/k8cKLWihp00FkUu4pfZj');
          }}
        />
      </Center>
    </FullScreen>
  );
};
