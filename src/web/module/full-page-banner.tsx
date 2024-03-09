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
  'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/burger-bytes.png?alt=media&token=1fab0f55-d9ce-4b76-b1ed-9ce076f74de5';

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
            navigate('/shop/Dv0rsZoBRc2lu5vg3h0P');
          }}
        />
      </Center>
    </FullScreen>
  );
};
