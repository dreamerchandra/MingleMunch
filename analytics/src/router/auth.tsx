import {
  ConfirmationResult,
  RecaptchaVerifier,
  getIdToken,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from '../config';
import { useInit } from './InitProvider';

export const removeCountryCode = (phoneNumber: string) => {
  let phNo = phoneNumber;
  // remove first zero
  if (phoneNumber.startsWith('0')) {
    phNo = phNo.replace(/^0/, '');
  }
  if (phoneNumber.startsWith('+91')) {
    phNo = phNo.replace(/^\+91/, '');
  }
  if (phoneNumber.length > 10 && phoneNumber.startsWith('91')) {
    phNo = phNo.replace(/^91/, '');
  }
  return phNo;
};

export const isPhoneNumberValid = (phoneNumber: string) => {
  return phoneNumber.length === 10;
};

export const useToSignIn = () => {
  const appVerifier = useRef<RecaptchaVerifier>();
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isPhoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
  const loginInstance = useRef<ConfirmationResult>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    appVerifier.current = new RecaptchaVerifier(
      firebaseAuth,
      'recaptcha-container',
      {
        size: 'invisible'
      }
    );
    appVerifier.current.render();
    firebaseAuth.useDeviceLanguage();
  }, []);
  const triggerOtp = useCallback((phoneNumber: string) => {
    if (!appVerifier.current) {
      return;
    }
    setIsLoading(true);
    setIsOtpRequested(false);
    setPhoneNumberInvalid(false);
    const number = removeCountryCode(phoneNumber);
    if (!isPhoneNumberValid(number)) {
      setIsLoading(false);
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
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
        setIsOtpRequested(true);
      });
  }, []);

  const loginWithOtp = useCallback((otp: string) => {
    if (!appVerifier.current) {
      return;
    }
    setIsLoading(true);
    loginInstance.current
      ?.confirm(otp)
      .then((result) => {
        console.log(result);
        navigate('/');
      })
      .catch((err) => {
        setError('Invalid OTP');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  return {
    isOtpRequested,
    triggerOtp,
    isPhoneNumberInvalid,
    loginWithOtp,
    error,
    isLoading
  };
};

export const useUser = () => {
  const userDetails = useInit();
  const updateUserDetails = (name: string) => {
    if (!userDetails.user) return;

    return updateProfile(userDetails.user, {
      displayName: name
    }).then(() => {
      getIdToken(userDetails.user!, true);
    });
  };

  const updateInviteCode = useCallback(async (code: string, name: string) => {
    return await post('/v1/referral', {
      inviteCode: code,
      name: name
    });
  }, []);
  return { userDetails, updateUserDetails, updateInviteCode };
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
      if (window.location.pathname === '/login') return;
      localStorage.setItem('redirect', window.location.pathname);
      return navigation('/login', {
        replace: true
      });
    } else {
      localStorage.removeItem('redirect');
    }
  }, [navigation, userDetails]);
};

export const useToLogin = () => {
  const { userDetails } = useUser();
  const navigation = useNavigate();
  const triggerLogin = useCallback(() => {
    const { loading, user } = userDetails;
    if (loading) {
      return;
    }
    if (user == null) {
      if (window.location.pathname === '/login') return;
      localStorage.setItem('redirect', window.location.pathname);
      return navigation('/login', {
        replace: true
      });
    } else {
      localStorage.removeItem('redirect');
    }
  }, [navigation, userDetails]);
  return { triggerLogin };
};
