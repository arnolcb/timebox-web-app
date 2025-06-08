// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithCredential,
  signOut,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from "@heroui/use-theme";
import { auth, googleProvider, db } from '../firebase';

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
  const { setTheme } = useTheme();

  // Function to load user settings and apply theme
  const loadUserSettings = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.settings?.preferences?.darkMode !== undefined) {
          const isDarkMode = data.settings.preferences.darkMode;
          setTheme(isDarkMode ? "dark" : "light");
          console.log('🎨 Theme applied from user settings:', isDarkMode ? 'dark' : 'light');
        } else {
          // Si no hay configuración guardada, usar tema claro por defecto
          setTheme("light");
          console.log('🎨 Default theme applied: light');
        }
      } else {
        // Si no existe documento de usuario, usar tema claro por defecto
        setTheme("light");
        console.log('🎨 No user settings found, default theme applied: light');
      }
    } catch (error) {
      console.error('❌ Failed to load user settings:', error);
      // En caso de error, usar tema claro por defecto
      setTheme("light");
    }
  };

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || ''
        };
        setUser(userData);
        console.log('✅ User authenticated:', userData.email);
        
        // Load user settings and apply theme
        await loadUserSettings(firebaseUser.uid);
      } else {
        setUser(null);
        // Reset to light theme when user logs out
        setTheme("light");
        console.log('❌ User signed out - theme reset to light');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setTheme]);

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
      
      // Theme will be reset to light in the onAuthStateChanged listener
      
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