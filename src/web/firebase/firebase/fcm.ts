import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from './firebsae-app';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseDb } from './db';

export const fcm = getMessaging(firebaseApp);

export const initFCM = async (userId: string) => {
  onMessage(fcm, (payload) => {
    console.log('Message received. ', payload);
  });
  const granted = await Notification.requestPermission();
  if (granted !== 'granted') return;
  const token = await getToken(fcm, {
    vapidKey:
      'BMZIXhbYHm5nWbOm_lyDHOpzR1e03DWVPV7Ab1ocsYkvZVdWt3En8K4Mpn6UUhuAHWdqSdvbMFj5khbk02cX_x0'
  });

  console.log(token, 'token');
  return await setDoc(doc(firebaseDb, 'fcmTokens', userId), { token, userId });
};
