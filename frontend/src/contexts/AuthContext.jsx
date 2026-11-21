"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken, setUnauthorizedHandler } from '@/lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'bravely_token';
const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

// status: 'loading' (checking a stored token) | 'authenticated' | 'unauthenticated' | 'unavailable' (API unreachable)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState('');

  const clearSession = useCallback((message = '') => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
    setToken(null);
    setUser(null);
    setNotice(message);
    setStatus('unauthenticated');
  }, []);

  const restore = useCallback(async () => {
    let stored = null;
    try { stored = localStorage.getItem(TOKEN_KEY); } catch { /* storage unavailable */ }
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }
    setToken(stored);
    setStatus('loading');
    try {
      const { user: me } = await api('/api/auth/me');
      setUser(me);
      setStatus('authenticated');
    } catch (err) {
      // 401 is already handled by the unauthorized handler; keep the token on network errors so retry works.
      if (err.code === 'network' || err.status >= 500) setStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler((code) => clearSession(code === 'token_expired' ? EXPIRED_MESSAGE : ''));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restore();
  }, [clearSession, restore]);

  const startSession = useCallback(({ token, user: nextUser }) => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
    setToken(token);
    setUser(nextUser);
    setNotice('');
    setStatus('authenticated');
    return nextUser;
  }, []);

  // login/signup throw ApiError (message + per-field `fields`) for the form to display.
  const login = useCallback(
    async ({ email, password }) => startSession(await api('/api/auth/login', { method: 'POST', body: { email, password } })),
    [startSession]
  );
  const signup = useCallback(
    async ({ name, email, password }) => startSession(await api('/api/auth/signup', { method: 'POST', body: { name, email, password } })),
    [startSession]
  );
  const logout = useCallback(() => clearSession(''), [clearSession]);

  // Local-only until the profile API exists (TODO(api): PUT /api/profile/resume).
  const updateProfileResume = useCallback((resumeData) => {
    setUser((prev) => (prev ? { ...prev, profileResume: resumeData } : null));
  }, []);
  const removeProfileResume = useCallback(() => {
    setUser((prev) => {
      if (!prev) return null;
      const { profileResume: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = useMemo(() => ({
    user, status, notice, isAuthenticated: status === 'authenticated',
    login, signup, logout, retry: restore, updateProfileResume, removeProfileResume,
  }), [user, status, notice, login, signup, logout, restore, updateProfileResume, removeProfileResume]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
