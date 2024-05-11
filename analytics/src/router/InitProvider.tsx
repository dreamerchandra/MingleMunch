import { User, getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { firebaseAuth } from '../config';

export type Role = 'admin' | 'vendor' | 'user' | 'guest';

const InitContext = createContext({
  user: null as User | null,
  loading: true,
  role: '' as Role
});

declare global {
  interface Window {
    token?: string;
  }
}

export const InitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userDetails, setUser] = useState({
    user: null as User | null,
    loading: true,
    role: '' as Role
  });
  useEffect(() => {
    const unsubs = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user, true);
        localStorage.setItem('isLoggedIn', 'true');
        const token = await user?.getIdToken();
        window.token = token;
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
