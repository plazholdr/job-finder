"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { InternshipProfile, InternshipDetails, CourseInformation, AssignmentInformation } from '@/types/internship';
import { api } from '@/lib/api';
import config from '@/config';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'company' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  profile: {
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  // Optional internship setup data stored on the user record
  internship?: {
    profile?: Partial<InternshipProfile>;
    details?: Partial<InternshipDetails>;
    courses?: CourseInformation[];
    assignments?: AssignmentInformation[];
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'company';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const isAuthenticated = !!user && !!token;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load token from localStorage on mount (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, [isHydrated]);

  // Set authorization header when token changes
  useEffect(() => {
    if (token) {
      // You can set a default header for all API calls here if needed
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // On staging, /api/* is proxied by Nginx directly to the backend and
      // the /api prefix is stripped. The backend exposes /authentication.
      const response = await fetch('/api/authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, strategy: 'local' }),
      });

      if (!response.ok) {
        let message = 'Login failed';
        try {
          const errorData = await response.json();
          message = errorData.error || errorData.message || message;
        } catch (_e) {}
        throw new Error(message);
      }

      const { accessToken, user: userData } = await response.json();

      setToken(accessToken);
      setUser(userData);

      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

    const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      // Call the backend API directly
      const response = await fetch(`${config.api.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let message = 'Registration failed';
        try {
          const err = await response.json();
          message = err.error || err.message || message;
        } catch (_e) {}
        throw new Error(message);
      }

      // Then auto-login using the same credentials
      const loginRes = await fetch(`${config.api.baseUrl}/authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          strategy: 'local',
        }),
      });

      if (!loginRes.ok) {
        // Registration succeeded but login failed
        return;
      }

      const { accessToken, user: userDataResp } = await loginRes.json();
      if (accessToken && userDataResp) {
        setToken(accessToken);
        setUser(userDataResp);
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('authUser', JSON.stringify(userDataResp));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Remove from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }

    // For now, we'll just do local logout
    // Backend logout can be added later if needed
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    try {
      const updatedUser = await api.patch<User>('/users/me', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login form (only on client side)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access
export function useRole() {
  const { user } = useAuth();

  return {
    role: user?.role,
    isStudent: user?.role === 'student',
    isCompany: user?.role === 'company',
    isAdmin: user?.role === 'admin',
  };
}
