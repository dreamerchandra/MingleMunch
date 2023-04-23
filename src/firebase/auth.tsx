import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from './firebase';

export const removeCountryCode = (phoneNumber: string) => {
  // remove first zero
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.replace(/^0/, '');
  }
  const regex = /^\+?\d{1,2}[- ]?/;
  return phoneNumber.replace(regex, '');
};

export const isPhoneNumberValid = (phoneNumber: string) => {
  return phoneNumber.length === 10;
};

export const useToSignIn = () => {
  const appVerifier = useRef<RecaptchaVerifier>();
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isPhoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
  const loginInstance = useRef<ConfirmationResult>();
  useEffect(() => {
    appVerifier.current = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (res: any) => {
          console.log(res);
        }
      },
      firebaseAuth
    );
    appVerifier.current.render();
    firebaseAuth.useDeviceLanguage();
  }, []);
  const triggerOtp = useCallback((phoneNumber: string) => {
    if (!appVerifier.current) {
      return;
    }
    setIsOtpRequested(false);
    setPhoneNumberInvalid(false);
    const number = removeCountryCode(phoneNumber);
    console.log(number);
    if (!isPhoneNumberValid(number)) {
      return setPhoneNumberInvalid(true);
    }
    return signInWithPhoneNumber(
      firebaseAuth,
      `+91${number}`,
      appVerifier.current
    )
      .then((confirmationResult) => {
        loginInstance.current = confirmationResult;
      })
      .catch((err) => {
        console.log('error triggering otp', err);
        setPhoneNumberInvalid(err.message);
      })
      .finally(() => setIsOtpRequested(true));
  }, []);

  const loginWithOtp = useCallback((otp: string) => {
    if (!appVerifier.current) {
      return;
    }
    loginInstance.current?.confirm(otp).then((result) => {
      console.log(result);
    });
  }, []);
  return { isOtpRequested, triggerOtp, isPhoneNumberInvalid, loginWithOtp };
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const updateUserDetails = (name: string) => {
    if (!user) return;
    return updateProfile(user, {
      displayName: name
    });
  };
  return { user, updateUserDetails };
};

export const useProtectedRoute = () => {
  const { user } = useUser();
  const navigation = useNavigate();
  console.log(user);
  useEffect(() => {
    if (!user) {
      navigation('/login');
    }
  }, [navigation, user]);
};
