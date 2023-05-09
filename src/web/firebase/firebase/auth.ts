import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { firebaseApp } from './firebsae-app';

export const firebaseAuth = getAuth(firebaseApp);
if (location.hostname === 'localhost') {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099', {
    disableWarnings: true
  });
}
