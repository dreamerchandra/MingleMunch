import { Close } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';

const getFullPageBannerShown = (): Record<string, boolean> => {
  const fullPage = window.localStorage.getItem('fullPage');
  if (fullPage) {
    const details = JSON.parse(fullPage);
    return details;
  }
  return {};
};
const banner =
  'https://firebasestorage.googleapis.com/v0/b/mingle-munch.appspot.com/o/Frame%204%20(2)%20(1).png?alt=media&token=aa76be00-b591-4098-9eb6-2db4f7e47536';

export const FullPageBanner = () => {
  const [hasShown, _setHasShown] = useState(() => {
    const details = getFullPageBannerShown();
    return details[banner];
  });
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
    <div
      style={{
        position: 'fixed',
        zIndex: 1000000,
        background: 'rgb(0 0 0 / 75%)',
        height: '100vh',
        width: '100vw',
        top: 0
      }}
    >
      <Button
        sx={{
          position: 'fixed',
          top: '7vh',
          right: '20px',
          zIndex: 10000000,
          borderRadius: '50%',
          height: '56px',
          width: '50px',
          boxShadow: '0px 0px 20px 0px #0000001f'
        }}
        color="error"
        variant="text"
        onClick={setShown}
      >
        <Close />
      </Button>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <img
          src={banner}
          style={{
            height: '75vh',
            width: '95vw',
            objectFit: 'contain'
          }}
          onClick={setShown}
        />
      </div>
    </div>
  );
};
