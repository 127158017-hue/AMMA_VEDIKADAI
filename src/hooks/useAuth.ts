/**
 * useAuth hook - Authentication context hook
 */

'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { AuthService } from '@/services/auth/authService';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { user, setUser, setLoading, setError, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error: any) {
        setError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    };

    checkAuth();
  }, [setUser, setLoading, setError]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await AuthService.login(email, password);
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      setLoading(true);
      const user = await AuthService.signup(email, password, name);
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      logout();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const user = await AuthService.loginWithGoogle();
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isReady,
    login,
    signup,
    logout: handleLogout,
    loginWithGoogle,
  };
};
