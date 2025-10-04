import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '@/lib/mockApi';
import { mockUser } from '@/lib/mockData';

interface User {
  id: string;
  email: string;
  role: string;
  is_admin: boolean;
  firstName?: string;
  lastName?: string;
  organization_name?: string;
  organization_logo_url?: string | null;
  must_reset_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await mockApi.getSession();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await mockApi.login(email, password);
      const response = await mockApi.getSession();
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const demoLogin = async () => {
    try {
      await mockApi.demoLogin();
      // Automatically set the demo user
      setUser(mockUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await mockApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      isLoading: loading,
      login, 
      demoLogin, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
