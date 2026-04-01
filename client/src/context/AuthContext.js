import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

// Set initial Authorization header if token exists in localStorage
const initialToken = localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor to attach token to all requests and handle token changes
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // On mount, check localStorage for token and fetch current user
  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(res.data.user);
      setToken(storedToken);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password, phoneNumber) => {
    const res = await axios.post('/api/auth/register', { name, email, password, phoneNumber });
    return res.data;
  };

  const updateProfile = async (updates) => {
    const res = await axios.put('/api/auth/me', updates);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const resendVerification = async () => {
    const res = await axios.post('/api/auth/resend-verification');
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    updateProfile,
    logout,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
