'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext } from '@/hooks/useAuth';
import { UserProfile, ApiResponse, LoginResponse } from '@/types';
import { api } from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.get<ApiResponse<UserProfile>>('/auth/profile');
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setUser(res.data.user);
    } else {
      throw new Error(res.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/register', {
      email, password, full_name: fullName,
    });
    if (res.success && res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setUser(res.data.user);
    } else {
      throw new Error(res.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
