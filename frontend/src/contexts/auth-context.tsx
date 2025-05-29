"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

  const isAuthenticated = !!user && !!token;

  // Load token from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Set authorization header when token changes
  useEffect(() => {
    if (token) {
      // You can set a default header for all API calls here if needed
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post<{ accessToken: string; user: User }>('/authentication', {
        email,
        password,
        strategy: 'local',
      });

      const { accessToken, user: userData } = response;

      setToken(accessToken);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
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
      
      // Create user
      const newUser = await api.post<User>('/users', userData);

      // Auto-login after registration
      await login(userData.email, userData.password);
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    // Optional: Call logout endpoint
    if (token) {
      api.delete('/authentication', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(console.error);
    }
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
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
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
      // Redirect to login or show login form
      window.location.href = '/auth/login';
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
