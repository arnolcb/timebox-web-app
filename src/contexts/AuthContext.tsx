// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithCredential,
  signOut,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credential?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || ''
        };
        setUser(userData);
        console.log('✅ User authenticated:', userData.email);
      } else {
        setUser(null);
        console.log('❌ User signed out');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credential?: string) => {
    try {
      setIsLoading(true);
      
      if (credential) {
        // If we receive a credential (from Google Identity), create Firebase credential
        const googleCredential = GoogleAuthProvider.credential(credential);
        await signInWithCredential(auth, googleCredential);
      } else {
        // Use Firebase popup sign-in directly
        const result = await signInWithPopup(auth, googleProvider);
        console.log('🔐 Firebase popup sign-in successful:', result.user.email);
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Failed to login with Google');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      
      // Clear Google session
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.cancel();
      }
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};