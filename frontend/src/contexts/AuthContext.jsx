"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithPassword, signupWithPassword, logoutAuth } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('aia_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  // Persist to localStorage whenever user changes
  useEffect(() => {
    // skip initial render if user is undefined vs null depending on logic
    if (user) {
      localStorage.setItem('aia_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aia_user');
    }
  }, [user]);

  const login = async ({ email, password }) => {
    const result = await loginWithPassword({ email, password });
    const userData = result?.user || { email, name: email.split('@')[0] };
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const signup = async ({ email, name, password }) => {
    const result = await signupWithPassword({ email, name, password });
    const userData = result?.user || { email, name };
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aia_user');
    logoutAuth();
  };

  const updateProfileResume = (resumeData) => {
    setUser(prev => prev ? { ...prev, profileResume: resumeData } : null);
  };

  const removeProfileResume = () => {
    setUser(prev => {
      if (!prev) return null;
      const { profileResume, ...rest } = prev;
      return rest;
    });
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateProfileResume, removeProfileResume }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
