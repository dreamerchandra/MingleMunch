import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { analytics, firebaseApp } from './firebsae-app';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { firebaseDb } from './db';
import LogRocket from 'logrocket';
import { logEvent } from 'firebase/analytics';

export const fcm = getMessaging(firebaseApp);

export const initFCM = async (userId: string) => {
  onMessage(fcm, (payload) => {
    console.log('Message received. ', payload);
  });
  LogRocket.track('FCM init', { userId });
  const granted = await Notification.requestPermission();
  logEvent(analytics, 'fcm init');
  if (granted !== 'granted') {
    LogRocket.track('notification denied', { userId });
    logEvent(analytics, 'notification denied');
    return;
  }
  LogRocket.track('notification granted', { userId });
  logEvent(analytics, 'notification granted');
  const token = await getToken(fcm, {
    vapidKey:
      'BMZIXhbYHm5nWbOm_lyDHOpzR1e03DWVPV7Ab1ocsYkvZVdWt3En8K4Mpn6UUhuAHWdqSdvbMFj5khbk02cX_x0'
  });

  return await setDoc(doc(firebaseDb, 'fcmTokens', userId), { token: arrayUnion(token), userId }, { merge: true, mergeFields: ['token']});
};
