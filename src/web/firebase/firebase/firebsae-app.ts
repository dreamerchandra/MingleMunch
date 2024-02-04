import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check';
const isLocal = window.location.hostname === 'localhost';

const firebaseConfig = {
  apiKey: 'AIzaSyCajB1KkrNGpB9eiM8ph2FFOTX35T7wB60',
  authDomain: 'mingle-munch.firebaseapp.com',
  projectId: 'mingle-munch',
  storageBucket: 'mingle-munch.appspot.com',
  messagingSenderId: '291354377634',
  appId: '1:291354377634:web:5f1d53b7cda2b2fd50c6fb',
  measurementId: !isLocal ? 'G-S2H7D2Z5LC' : ''
};
console.log(firebaseConfig.measurementId, 'firebaseConfig.measurementId');
export const firebaseApp = initializeApp(firebaseConfig);
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(
    isLocal
      ? 'BA0C97DA-1540-4109-B786-883273B68DEB'
      : '6Lc1NWYpAAAAANsYxxYzJBdptMY9_Lyl7Plhg5Jx'
  ),
  isTokenAutoRefreshEnabled: true
});
export const analytics = isLocal ? undefined : getAnalytics(firebaseApp);
