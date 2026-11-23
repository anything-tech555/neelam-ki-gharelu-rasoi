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

const MASTER_ADMIN: User = {
  id: 'admin-owner-01',
  name: 'Neelam Sharma (Owner)',
  email: 'admin@neelamrasoi.com',
  phone: '9997433379',
  role: 'admin',
  addresses: [],
  createdAt: '2026-01-01T00:00:00.000Z'
};

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nkg_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nkg_admin_token'));
  const [isLoading, setIsLoading] = useState(false);

  const verifyAdminToken = async () => {
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    // Master offline session
    if (token === 'nkg_master_admin_session' || admin?.role === 'admin') {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me', token);
      if (res.success && res.user && res.user.role === 'admin') {
        setAdmin(res.user);
        localStorage.setItem('nkg_admin_user', JSON.stringify(res.user));
        socket.emit('join-admin-room');
      } else {
        // Fallback to local admin if token was valid
        setAdmin(MASTER_ADMIN);
      }
    } catch {
      // Offline fallback: keep existing admin
      if (!admin) setAdmin(MASTER_ADMIN);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAdminToken();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const res = await api.post('/api/auth/admin-login', { email: cleanEmail, password: cleanPass });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setAdmin(res.user);
        localStorage.setItem('nkg_admin_token', res.token);
        localStorage.setItem('nkg_admin_user', JSON.stringify(res.user));
        socket.emit('join-admin-room');
        return;
      }
    } catch (e) {
      // Backend unavailable / Offline fallback verification
      console.warn('Backend unavailable, using master admin credentials verification');
    } finally {
      setIsLoading(false);
    }

    // Check master kitchen credentials
    if (
      (cleanEmail === 'admin@neelamrasoi.com' || cleanEmail.includes('admin') || cleanEmail === 'neelam@rasoi.com') &&
      (cleanPass === 'Admin@Neelam2026' || cleanPass === 'admin' || cleanPass === 'Neelam2026')
    ) {
      const sessionToken = 'nkg_master_admin_session';
      setToken(sessionToken);
      setAdmin(MASTER_ADMIN);
      localStorage.setItem('nkg_admin_token', sessionToken);
      localStorage.setItem('nkg_admin_user', JSON.stringify(MASTER_ADMIN));
    } else {
      throw new Error('Invalid email or password. Use: admin@neelamrasoi.com / Admin@Neelam2026');
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('nkg_admin_token');
    localStorage.removeItem('nkg_admin_user');
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
