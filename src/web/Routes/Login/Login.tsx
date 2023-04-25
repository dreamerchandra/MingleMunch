import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormEvent, createRef, useRef } from 'react';
import { useToSignIn, useUser } from '../../firebase/auth';
import { Profile } from './Profile';

export function LoginPage() {
  const { isOtpRequested, triggerOtp, isPhoneNumberInvalid, loginWithOtp } =
    useToSignIn();
  const { user } = useUser();
  const form = useRef({
    phoneNumber: createRef<HTMLInputElement>()
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const otp = data.get('otp');
    loginWithOtp(otp as string);
  };

  return (
    <>
      {user ? (
        <Profile />
      ) : (
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                autoFocus
                inputRef={form.current?.phoneNumber}
                error={isPhoneNumberInvalid}
                disabled={isOtpRequested}
              />
              {!isOtpRequested ? (
                <>
                  <Button
                    id="sign-in-button"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => {
                      triggerOtp(form.current.phoneNumber.current?.value || '');
                    }}
                  >
                    Request Otp
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="otp"
                    label="Otp"
                    type="password"
                    id="otp"
                    autoComplete="otp"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Sign In
                  </Button>
                </>
              )}
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          {isOtpRequested ? null : <div id="recaptcha-container"></div>}
        </Container>
      )}
    </>
  );
}
