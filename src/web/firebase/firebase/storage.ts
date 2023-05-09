// import { getAnalytics } from 'firebase/analytics';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { firebaseApp } from './firebsae-app';

export const firebaseStorage = getStorage(firebaseApp);
if (location.hostname === 'localhost') {
  connectStorageEmulator(firebaseStorage, 'localhost', 9199);
}
// Initialize Firebase
// const analytics = getAnalytics(firebaseApp);
