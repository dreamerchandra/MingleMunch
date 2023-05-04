import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { firebaseAuth } from '../../firebase/firebase';
import { getIdTokenResult } from 'firebase/auth';
import { Role } from '../../../common/types/roles';

const InitContext = createContext({
  user: firebaseAuth.currentUser,
  loading: true,
  role: '' as Role
});

export const InitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userDetails, setUser] = useState({
    user: firebaseAuth.currentUser,
    loading: true,
    role: '' as Role
  });
  useEffect(() => {
    const unsub = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user, true);
        setUser({
          user: user,
          loading: false,
          role: tokenResult.claims.role || 'user'
        });
        return;
      }
      setUser({
        user: user,
        loading: false,
        role: 'user'
      });
    });
    return unsub;
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
