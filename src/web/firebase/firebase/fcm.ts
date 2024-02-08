import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Analytics } from '../../../common/analytics';
import { post } from '../fetch';
import { firebaseApp } from './firebsae-app';

export const fcm = getMessaging(firebaseApp);

export const isNotificationSupported = () =>
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

let init = false;

const setup = async () => {
  if (init) {
    return;
  }
  init = true;

  const token = await getToken(fcm, {
    vapidKey:
      'BMZIXhbYHm5nWbOm_lyDHOpzR1e03DWVPV7Ab1ocsYkvZVdWt3En8K4Mpn6UUhuAHWdqSdvbMFj5khbk02cX_x0'
  });
  const lastToken = localStorage.getItem('lastToken');
  if (lastToken === token) {
    return;
  }
  localStorage.setItem('lastToken', token);
  const analyticId = localStorage.getItem('analyticsId');
  await post('/v1/fcm-register', {
    token,
    analyticId
  });
};

export const reuploadToken = async () => {
  if (!isNotificationSupported()) {
    return;
  }
  if (Notification.permission === 'granted') {
    setup();
  }
};

export const initFCM = async (userId?: string) => {
  if (!isNotificationSupported()) {
    return;
  }
  onMessage(fcm, (payload) => {
    console.log('Message received. ', payload);
  });
  Analytics.pushEvent('fcm init');
  const granted = await Notification.requestPermission();
  localStorage.setItem('notification', granted);
  if (granted !== 'granted') {
    Analytics.pushEvent('notification denied', { userId });
    return;
  }
  Analytics.pushEvent('notification granted', { userId });
  setup();
};
