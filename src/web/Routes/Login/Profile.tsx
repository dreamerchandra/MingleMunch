import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../firebase/auth';

export const Profile = () => {
  const navigation = useNavigate();
  const {
    updateUserDetails,
    userDetails: { user }
  } = useUser();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    await updateUserDetails(name as string);
    const path = localStorage.getItem('redirect') || '/';
    localStorage.removeItem('redirect');
    navigation(path, {
      replace: true
    });
  };

  useEffect(() => {
    if (user?.displayName) {
      const path = localStorage.getItem('redirect') || '/';
      console.log('redirecting to', localStorage.getItem('redirect'));
      navigation(path, {
        replace: true
      });
    }
  }, [navigation, user]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 1,
          marginTop: 8,
          height: '75vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Your Name"
          name="name"
          autoComplete="name"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mb: 2 }}
        >
          Take me In
        </Button>
      </Box>
    </Container>
  );
};
