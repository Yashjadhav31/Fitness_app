import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { UserProfile } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const bypassAuth =
    import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH !== 'false';

  const signup = async (email: string, password: string) => {
    if (bypassAuth) {
      const mock = { uid: 'dev-user', email } as unknown as User;
      setCurrentUser(mock);
      return mock;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const login = async (email: string, password: string) => {
    if (bypassAuth) {
      const mock = { uid: 'dev-user', email } as unknown as User;
      setCurrentUser(mock);
      return mock;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    if (bypassAuth) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const { getUserProfile } = await import('../services/firestoreService');
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    if (bypassAuth) {
      const mock = { uid: 'dev-user', email: 'dev@example.com' } as unknown as User;
      setCurrentUser(mock);
      void import('../services/firestoreService')
        .then(({ getUserProfile }) => getUserProfile(mock.uid))
        .then((profile) => {
        setUserProfile(profile);
        setLoading(false);
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        setUserProfile(null);
        return;
      }

      void import('../services/firestoreService')
        .then(({ getUserProfile }) => getUserProfile(user.uid))
        .then((profile) => setUserProfile(profile))
        .catch((error) => {
          console.error('Error resolving auth state/profile:', error);
          setUserProfile(null);
        });
    });

    return unsubscribe;
  }, [bypassAuth]);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
