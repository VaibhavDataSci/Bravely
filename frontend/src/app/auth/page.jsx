"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { C } from '@/constants/theme';
import { GlassCard, AIAvatar, MicWave, NeonInput } from '@/components/shared';
import { ParticlesBg } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Avatar speaking animation cycle
  useEffect(() => {
    const id = setInterval(() => { setSpeaking(true); setTimeout(() => setSpeaking(false), 2800); }, 5000);
    return () => clearInterval(id);
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    let t;
    if (error) t = setTimeout(() => setError(''), 0);
    return () => clearTimeout(t);
  }, [email, password, name, confirm, error]);

  // Validation helper
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        login({ email: email.trim(), name: '' });
      } else {
        signup({ email: email.trim(), name: name.trim() });
      }
      setLoading(false);
      router.push('/dashboard');
    }, 1400);
  };

  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: C.bgBase }}>
      {/* Left: visual panel */}
      <div style={{
        width: '46%', position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse at 40% 40%, #171A31 0%, #0D1023 60%, #070816 100%)`, // Bravely background
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        borderRight: `1px solid ${C.borderMid}`,
      }}>
        <ParticlesBg />
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <img src="/Bravely-logo.png" alt="Bravely" style={{ width: 140, objectFit: 'contain', marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: C.textSecondary, fontWeight: 400 }}>Master Difficult Conversations.</div>
        </div>
        <AIAvatar size={240} speaking={speaking} style={{ zIndex: 2 }} />
        {/* Quote bubble */}
        <div style={{ zIndex: 2, maxWidth: 300 }}>
          <GlassCard style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, fontStyle: 'italic' }}>
              &quot;{speaking ? 'Welcome back! Ready for your session?' : 'Let&apos;s analyze your communication style.'}&quot;
            </div>
            <MicWave active={speaking} />
          </GlassCard>
        </div>
        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
          {[
            ['◉', 'Luminal AI precision'],
            ['◈', 'Visual Analytics'],
            ['⌥', 'Intelligence Feed'],
            ['⬡', 'Real-time Stats'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: C.primary, fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 12, color: C.textSecondary }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px', overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fade-up 0.5s ease' }}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: 2, background: C.bgCard, borderRadius: 10, padding: 4, marginBottom: 36, border: `1px solid ${C.borderMid}` }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: mode === m ? `linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.2))` : 'transparent',
                color: mode === m ? C.primary : C.textMuted,
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
                border: mode === m ? `1px solid ${C.primary}` : '1px solid transparent',
                transition: 'all 0.25s', textTransform: 'capitalize',
              }}>{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em', color: C.textPrimary }}>
            {mode === 'login' ? 'Welcome back' : 'Join Bravely'}
          </h2>
          <p style={{ fontSize: 14, color: C.textSecondary, marginBottom: 32 }}>
            {mode === 'login' ? 'Sign in to continue your journey' : 'Start mastering conversations today'}
          </p>

          {/* Social logins */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            {[['G', 'Continue with Google', '#e4e1ee'], ['⌥', 'Continue with GitHub', '#c7c4d8']].map(([icon, label, color]) => (
              <button key={label} onClick={handleSubmit} style={{
                flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                background: C.bgCard, border: `1px solid ${C.borderMid}`,
                color: C.textPrimary, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontWeight: 900, color: color }}>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: C.borderMid }} />
            <span style={{ fontSize: 11, color: C.textMuted }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: C.borderMid }} />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              background: `${C.error}15`, border: `1px solid ${C.error}40`,
              color: C.error, fontSize: 13, fontWeight: 500,
              animation: 'fade-up 0.3s ease',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {mode === 'signup' && (
              <NeonInput label="Full Name" placeholder="Alex Martinez" icon="👤" value={name} onChange={e => setName(e.target.value)} />
            )}
            <NeonInput label="Email Address" type="email" placeholder="alex@company.com" icon="✉" value={email} onChange={e => setEmail(e.target.value)} />
            <NeonInput label="Password" type="password" placeholder="••••••••••" icon="🔒" value={password} onChange={e => setPassword(e.target.value)} />
            {mode === 'signup' && (
              <NeonInput label="Confirm Password" type="password" placeholder="••••••••••" icon="🔒" value={confirm} onChange={e => setConfirm(e.target.value)} />
            )}
          </div>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>I want to join as</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['candidate','🎯','Candidate','Improve skills'], ['interviewer','🎙','Coach','Provide feedback']].map(([id, icon, label, sub]) => (
                  <button key={id} onClick={() => setRole(id)} style={{
                    flex: 1, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    background: role === id ? `linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.1))` : C.bgCard,
                    border: `1px solid ${role === id ? C.primary : C.borderMid}`,
                    transition: 'all 0.25s',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === id ? C.primary : C.textPrimary }}>{label}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Remember me / Forgot */}
          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div onClick={() => setRemember(r => !r)} style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: remember ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : C.bgCard,
                  border: `1px solid ${remember ? C.primary : C.borderMid}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', transition: 'all 0.2s', cursor: 'pointer',
                }}>{remember ? '✓' : ''}</div>
                <span style={{ fontSize: 13, color: C.textSecondary }}>Remember me</span>
              </label>
              <button style={{ fontSize: 13, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Forgot password?</button>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? `rgba(167, 139, 250, 0.3)` : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700,
            boxShadow: loading ? 'none' : `0 0 20px rgba(167, 139, 250, 0.3)`,
            transition: 'all 0.3s', letterSpacing: '0.02em',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading
              ? (mode === 'login' ? '⟳ Signing in…' : '⟳ Creating account…')
              : (mode === 'login' ? 'Sign In →' : 'Create Account →')
            }
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: C.textMuted }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
