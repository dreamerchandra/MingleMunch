// import { getAnalytics } from 'firebase/analytics';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { firebaseApp } from './firebsae-app';

const functions = getFunctions(firebaseApp);
if (location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
// Initialize Firebase
// const analytics = getAnalytics(firebaseApp);
