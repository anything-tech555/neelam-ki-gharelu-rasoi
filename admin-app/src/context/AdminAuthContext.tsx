import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, socket } from '../services/api';
import { User } from '../types/shared';

interface AdminAuthContextType {
  admin: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nkg_admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  const verifyAdminToken = async () => {
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me', token);
      if (res.success && res.user && res.user.role === 'admin') {
        setAdmin(res.user);
        // Connect socket to admin room
        socket.emit('join-admin-room');
      } else {
        logout();
      }
    } catch (e) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAdminToken();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/api/auth/admin-login', { email, password: pass });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setAdmin(res.user);
      localStorage.setItem('nkg_admin_token', res.token);
      socket.emit('join-admin-room');
    } else {
      throw new Error(res.message || 'Admin authentication failed');
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('nkg_admin_token');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: Boolean(admin && admin.role === 'admin')
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
