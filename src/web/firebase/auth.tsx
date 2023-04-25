import {
  ConfirmationResult,
  RecaptchaVerifier,
  getIdTokenResult,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from './firebase';
import { Role } from '../../common/types/roles';

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
        size: 'invisible'
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
  const [userDetails, setUser] = useState({
    user: firebaseAuth.currentUser,
    loading: true,
    role: '' as Role
  });
  useEffect(() => {
    firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user, true);
        setUser({
          user: user,
          loading: false,
          role: tokenResult.claims.role || 'user'
        });
        return;
      }
      setUser({
        user: user,
        loading: false,
        role: 'user'
      });
    });
  }, []);

  const updateUserDetails = (name: string) => {
    if (!userDetails.user) return;

    return updateProfile(userDetails.user, {
      displayName: name
    });
  };
  return { userDetails, updateUserDetails };
};

export const useProtectedRoute = () => {
  const { userDetails } = useUser();
  const navigation = useNavigate();
  useEffect(() => {
    const { loading, user } = userDetails;
    if (loading) {
      return;
    }
    if (user == null) {
      return navigation('/login');
    }
  }, [navigation, userDetails]);
};
