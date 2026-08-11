import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Fetch full profile (includes full_name, phone, role, etc.)
      const response = await api.get('/auth/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: partialUser } = response.data;
      localStorage.setItem('access_token', access_token);

      // We can set authenticated state immediately so UI unblocks
      setIsAuthenticated(true);
      setUser(partialUser);

      // Fetch the full profile asynchronously in background
      api.get('/auth/profile').then(profileResponse => {
        setUser(profileResponse.data);
      }).catch(err => {
        console.error("Failed to fetch full profile in background:", err);
      });

      return { success: true };
    } catch (error) {
      let errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Login failed. Please try again.';
      if (typeof errorMsg !== 'string' || errorMsg.includes('<html') || errorMsg.length > 200) {
        errorMsg = 'Login failed. Please try again.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // After registering, log in to get the full profile
      return await login(userData.email, userData.password);
    } catch (error) {
      let errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Registration failed. Please try again.';
      if (typeof errorMsg !== 'string' || errorMsg.includes('<html') || errorMsg.length > 200) {
        errorMsg = 'Registration failed. Please try again.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
