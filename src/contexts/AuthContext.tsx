import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
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
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      
      // Decode the JWT token to get user info
      const payloadBase64 = credential.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      
      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('google_token', credential);
      
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('google_token');
      throw new Error('Failed to process login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('google_token');
    localStorage.removeItem('g_state');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear Google session
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.cancel();
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
    
    // Clear Google cookies
    const cookiesToClear = [
      'g_state', 'g_csrf_token', '__Secure-1PSID', '__Secure-3PSID',
      'SAPISID', 'APISID', 'SSID', 'HSID', 'SID', 'SIDCC'
    ];
    
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.google.com;`;
    });
    
    // Force page reload for complete cleanup
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
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