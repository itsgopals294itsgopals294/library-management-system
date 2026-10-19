import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('athena_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('athena_token'));
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('athena_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('athena_token', res.token);
        localStorage.setItem('athena_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('athena_token', res.token);
        localStorage.setItem('athena_user', JSON.stringify(res.user));
        toast.success('Registration successful! Welcome to Athena LMS.');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('athena_token');
    localStorage.removeItem('athena_user');
    toast.success('Signed out safely.');
  };

  // Instant Demo Switcher for fast evaluation
  const switchDemoAccount = async (roleName) => {
    const demoAccounts = {
      admin: { email: 'admin@athena.edu', pass: 'Admin@123' },
      librarian: { email: 'librarian@athena.edu', pass: 'Lib@123' },
      student: { email: 'student@athena.edu', pass: 'Student@123' },
      faculty: { email: 'faculty@athena.edu', pass: 'Faculty@123' },
    };

    const target = demoAccounts[roleName];
    if (target) {
      const res = await login(target.email, target.pass);
      return res;
    }
  };

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoAccount,
        isStaff,
        isAdmin,
        isLibrarian,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
