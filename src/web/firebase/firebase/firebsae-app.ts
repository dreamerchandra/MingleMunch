import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCajB1KkrNGpB9eiM8ph2FFOTX35T7wB60',
  authDomain: 'mingle-munch.firebaseapp.com',
  projectId: 'mingle-munch',
  storageBucket: 'mingle-munch.appspot.com',
  messagingSenderId: '291354377634',
  appId: '1:291354377634:web:5f1d53b7cda2b2fd50c6fb'
};
export const firebaseApp = initializeApp(firebaseConfig);
