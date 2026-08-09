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
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);

      // After storing token, fetch the full profile so user.full_name etc. are available
      const profileResponse = await api.get('/auth/profile');
      setUser(profileResponse.data);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // After registering, log in to get the full profile
      return await login(userData.email, userData.password);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.msg || error.message || 'Registration failed';
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
