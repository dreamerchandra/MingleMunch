import { logEvent } from 'firebase/analytics';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  getIdToken,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import LogRocket from 'logrocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '../../common/analytics';
import { useInit } from '../module/Context/InitProvider';
import { post } from './fetch';
import { firebaseAuth } from './firebase/auth';
import { analytics } from './firebase/firebsae-app';

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
  const [error, setError] = useState<string | null>(null);
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
        Analytics.pushEvent('otp_error', { error: err.message });
        LogRocket.captureException(err);
        setError(err.message);
      })
      .finally(() => setIsOtpRequested(true));
  }, []);

  const loginWithOtp = useCallback((otp: string) => {
    if (!appVerifier.current) {
      return;
    }
    loginInstance.current
      ?.confirm(otp)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        setError('Invalid OTP');
        LogRocket.captureException(err);
        logEvent(analytics!, 'ph_error');
      });
  }, []);
  return {
    isOtpRequested,
    triggerOtp,
    isPhoneNumberInvalid,
    loginWithOtp,
    error
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

  const updateInviteCode = useCallback(async (code: string) => {
    return await post('/v1/referral', {
      inviteCode: code
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
