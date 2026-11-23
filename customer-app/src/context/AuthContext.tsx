import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, SavedAddress } from '../types/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string; address?: string; landmark?: string }) => Promise<void>;
  logout: () => void;
  addAddress: (addr: { tag: 'Home' | 'Work' | 'Other'; address: string; landmark?: string; isDefault?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nkg_cust_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/api/auth/me', token);
      if (res.success) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (e) {
      console.warn('Profile fetch error, token might be invalid:', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.post('/api/auth/login', { identifier, password: pass });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nkg_cust_token', res.token);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (payload: { name: string; email: string; phone: string; password: string; address?: string; landmark?: string }) => {
    const res = await api.post('/api/auth/register', payload);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nkg_cust_token', res.token);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nkg_cust_token');
  };

  const addAddress = async (addr: { tag: 'Home' | 'Work' | 'Other'; address: string; landmark?: string; isDefault?: boolean }) => {
    if (!token) throw new Error('Please login to save addresses');
    const res = await api.post('/api/auth/addresses', addr, token);
    if (res.success && user) {
      setUser({ ...user, addresses: res.addresses });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, addAddress, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
