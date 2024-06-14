import { Alert } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { FormEvent, createRef, useRef } from 'react';
import { useToSignIn, useUser } from '../../firebase/auth';
import { Profile } from './Profile';
import LoadingButton from '@mui/lab/LoadingButton';

export function LoginPage() {
  const {
    isOtpRequested,
    triggerOtp,
    isPhoneNumberInvalid,
    loginWithOtp,
    error,
    isLoading
  } = useToSignIn();
  const {
    userDetails: { user }
  } = useUser();
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
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            height: '100svh'
          }}
        >
          <div
            style={{
              height: '70vh'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <img src="./logo_with_best_price_v1.png" width={370} />
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
                  <LoadingButton
                    id="sign-in-button"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => {
                      triggerOtp(form.current.phoneNumber.current?.value || '');
                    }}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Request Otp
                  </LoadingButton>
                ) : (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="otp"
                      label="Otp"
                      id="otp"
                      autoComplete="otp"
                      inputMode="numeric"
                      inputProps={{ inputMode: 'numeric' }}
                    />
                    <LoadingButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 3, mb: 2 }}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Sign In/Sign up
                    </LoadingButton>
                  </>
                )}
              </Box>
              <Alert severity="error" sx={{ display: error ? 'flex' : 'none' }}>
                {error}
                <Button color="info" href="tel:+918220080109">
                  Call Us
                </Button>
              </Alert>
            </Box>
          </div>
          {isOtpRequested ? null : <div id="recaptcha-container"></div>}
        </Container>
      )}
    </>
  );
}
