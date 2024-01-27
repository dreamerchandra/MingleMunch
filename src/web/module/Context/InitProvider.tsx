import { User, getIdTokenResult } from 'firebase/auth';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { Role } from '../../../common/types/roles';
import { firebaseAuth } from '../../firebase/firebase/auth';

const InitContext = createContext({
  user: null as User | null,
  loading: true,
  role: '' as Role
});

export const InitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userDetails, setUser] = useState({
    user: null as User | null,
    loading: true,
    role: '' as Role
  });
  useEffect(() => {
    const isLoggedOut = !firebaseAuth.currentUser;
    let timerId: any = null;
    if(isLoggedOut) {
      timerId = setTimeout(() => {
        setUser({
          user: null,
          loading: false,
          role: 'user'
        })
      }, 1000)
    }
    const unsubs = firebaseAuth.onAuthStateChanged(async (user) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (user) {
        const tokenResult = await getIdTokenResult(user, true);
        localStorage.setItem('isLoggedIn', 'true');
        setUser({
          user: user,
          loading: false,
          role: tokenResult.claims.role || 'user'
        });
        return;
      }
      localStorage.setItem('isLoggedIn', 'false');
      setUser({
        user: user,
        loading: false,
        role: 'user'
      });
    });
    return unsubs;
  }, []);
  return (
    <InitContext.Provider value={userDetails}>{children}</InitContext.Provider>
  );
};

export const useInit = () => {
  const userDetails = useContext(InitContext);
  if (!userDetails) {
    throw new Error('useInit must be used within InitProvider');
  }
  return userDetails;
};
