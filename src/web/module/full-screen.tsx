import { FC } from 'react';

export const FullScreen: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 1000000,
        background: 'rgb(0 0 0 / 75%)',
        height: '100svh',
        width: '100vw',
        top: 0
      }}
    >
      {children}
    </div>
  );
};

export const Center: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {children}
    </div>
  );
};
