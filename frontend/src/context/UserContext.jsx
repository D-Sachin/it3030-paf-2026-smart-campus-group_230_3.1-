import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return {
        success: false,
        message: 'Email and password are required.'
      };
    }

    try {
      const response = await apiClient.post('/auth/login', { email: normalizedEmail, password: normalizedPassword });
      const data = response.data;
      
      // Check if 2FA is required
      if (data.twoFactorRequired) {
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorSetup: data.twoFactorSetup,
          qrCodeUrl: data.qrCodeUrl,
          tempToken: data.tempToken
        };
      }

      // Normal login (no 2FA)
      const { token: authToken, ...userData } = data;
      setUser(userData);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);

      if (!error.response) {
        return {
          success: false,
          message: 'Cannot reach server. Please verify backend is running on port 8081.'
        };
      }

      if (error.response.status === 401) {
        return {
          success: false,
          message: typeof error.response.data === 'string'
            ? error.response.data
            : 'Invalid email or password'
        };
      }

      return { 
        success: false, 
        message: typeof error.response?.data === 'string' 
          ? error.response.data 
          : (error.response?.data?.message || error.response?.data?.error || 'Server error occurred')
      };
    }
  };

  const verifyTwoFactor = async (tempToken, code) => {
    try {
      const response = await apiClient.post('/auth/verify-2fa', { tempToken, code });
      const { token: authToken, ...userData } = response.data;
      
      setUser(userData);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      console.error('2FA verification failed:', error);
      return {
        success: false,
        message: typeof error.response?.data === 'string'
          ? error.response.data
          : (error.response?.data?.message || error.response?.data?.error || '2FA verification failed')
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await apiClient.post('/auth/google', { token: credential });
      const { token: authToken, ...userData } = response.data;
      
      setUser(userData);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      return { 
        success: false, 
        message: typeof error.response?.data === 'string' 
          ? error.response.data 
          : (error.response?.data?.message || error.response?.data?.error || 'Google login failed')
      };
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <UserContext.Provider value={{ user, token, login, verifyTwoFactor, googleLogin, logout, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
