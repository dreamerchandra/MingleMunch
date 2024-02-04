import { Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { InviteCode } from './InviteCode';

export const Profile = () => {
  useProtectedRoute();
  return (
    <div>
      <Header title='Profile'/>
      <Container
        component="main"
        sx={{
          height: 'calc(100dvh - 60px)',
          overflow: 'auto',
          p: 0,
          width: 'min(100vw, 1000px)',
          m: 'auto'
        }}
      >
        <InviteCode />
      </Container>
    </div>
  );
};
