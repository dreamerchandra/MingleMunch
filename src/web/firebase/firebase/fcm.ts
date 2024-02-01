import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Analytics } from '../../../common/analytics';
import { firebaseDb } from './db';
import { firebaseApp } from './firebsae-app';

export const fcm = getMessaging(firebaseApp);

export const initFCM = async (userId: string) => {
  onMessage(fcm, (payload) => {
    console.log('Message received. ', payload);
  });
  Analytics.pushEvent('fcm init');
  const granted = await Notification.requestPermission();
  localStorage.setItem('notification', granted);
  if (granted !== 'granted') {
    Analytics.pushEvent('notification denied');
    return;
  }
  Analytics.pushEvent('notification granted', { userId });
  const token = await getToken(fcm, {
    vapidKey:
      'BMZIXhbYHm5nWbOm_lyDHOpzR1e03DWVPV7Ab1ocsYkvZVdWt3En8K4Mpn6UUhuAHWdqSdvbMFj5khbk02cX_x0'
  });

  return await setDoc(
    doc(firebaseDb, 'fcmTokens', userId),
    { token: arrayUnion(token), userId },
    { merge: true, mergeFields: ['token'] }
  );
};
