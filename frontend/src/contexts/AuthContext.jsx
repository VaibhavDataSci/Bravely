"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aia_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setIsAuthenticated(true);
      }
    } catch {}
  }, []);

  // Persist to localStorage whenever user changes
  useEffect(() => {
    // skip initial render if user is undefined vs null depending on logic
    if (user) {
      localStorage.setItem('aia_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aia_user');
    }
  }, [user]);

  const login = ({ email, name }) => {
    const userData = { email, name: name || email.split('@')[0] };
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const signup = ({ email, name }) => {
    const userData = { email, name };
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aia_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
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
