import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Helper function to extract clear error message from backend API error response
   */
  const extractErrorMessage = useCallback((err) => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
      return err.response.data.errors.map((e) => e.msg || e.message).join(', ');
    }
    return err.message || 'An unexpected error occurred. Please try again.';
  }, []);

  /**
   * Restores authenticated user session on initial load or page refresh
   */
  const restoreUserSession = useCallback(async () => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getProfile();
      if (res.status === 'success' && res.data?.user) {
        setUser(res.data.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('[AUTH CONTEXT ERROR] Failed to restore session:', err);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreUserSession();
  }, [restoreUserSession]);

  /**
   * Authenticates user via Login API, saves JWT to localStorage, and updates context state
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.status === 'success' && res.token) {
        const receivedToken = res.token;
        const receivedUser = res.data?.user;

        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      return { success: false, message: msg };
    }
  }, [extractErrorMessage]);

  /**
   * Registers a new user via Register API and automatically logs them in
   */
  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res.status === 'success') {
        const loginRes = await login(userData.email, userData.password);
        if (loginRes.success) {
          return { success: true, message: res.message, autoLogged: true };
        }
        return { success: true, message: res.message, autoLogged: false };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      return { success: false, message: msg };
    }
  }, [login, extractErrorMessage]);

  /**
   * Logs out current user and clears JWT token from localStorage
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, token, loading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
