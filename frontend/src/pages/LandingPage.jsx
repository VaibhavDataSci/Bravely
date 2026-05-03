import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '../components/shared';

// ─── PAGE 1: LANDING ─────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [speaking, setSpeaking] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setSpeaking(true), 1500);
    const t2 = setTimeout(() => setSpeaking(false), 4500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(7,13,26,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(90deg, ${C.cyan}, ${C.violetBright})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Interview Arena
          </div>
          <Tag>Beta</Tag>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <NeonButton variant="ghost" size="sm">Features</NeonButton>
          <NeonButton variant="ghost" size="sm">Pricing</NeonButton>
          <NeonButton variant="outline" size="sm" onClick={() => navigate('/auth')}>Sign In</NeonButton>
          <NeonButton size="sm" onClick={() => navigate('/auth')}>Get Started →</NeonButton>
        </div>
      </div>
      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 80px', gap: 80 }}>
        {/* Left text */}
        <div style={{ flex: 1, maxWidth: 520, animation: 'fade-up 0.8s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
            <span style={{ fontSize: 13, color: C.green, fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>LIVE — AI Interviewer Online</span>
          </div>
          <h1 style={{
            fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            background: `linear-gradient(135deg, #ffffff 30%, ${C.cyan} 70%, ${C.violetBright} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textWrap: 'balance',
          }}>
            Practice Interviews with AI Humans
          </h1>
          <p style={{ fontSize: 18, color: C.textDim, lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
            Immersive 3D AI interviewers with real-time voice, synchronized lip movement, and instant feedback. Land your dream job with confidence.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <NeonButton size="lg" onClick={() => navigate('/solo')}>Start Free Interview</NeonButton>
            <NeonButton variant="outline" size="lg" onClick={() => navigate('/lobby')}>👥 Peer Arena</NeonButton>
            <NeonButton variant="ghost" size="lg" onClick={() => navigate('/auth')}>Sign In →</NeonButton>
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[['50K+', 'Interviews Done'], ['94%', 'Success Rate'], ['200+', 'Job Roles']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.cyan }}>{n}</div>
                <div style={{ fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Right: Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, animation: 'fade-up 0.8s ease 0.2s both' }}>
          <AIAvatar size={320} speaking={speaking} />
          {/* Speaking indicator */}
          <GlassCard style={{ padding: '16px 28px', textAlign: 'center', minWidth: 280 }}>
            <div style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>
              {speaking ? '🎙 AI is speaking...' : '"Tell me about yourself"'}
            </div>
            <MicWave active={speaking} />
          </GlassCard>
          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Voice Sync', 'Real-time Feedback', '3D Avatar', 'AI Scoring', 'Coding Rounds'].map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom ticker */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 0', overflow: 'hidden', background: 'rgba(7,13,26,0.8)' }}>
        <div style={{ display: 'inline-flex', gap: 60, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
          {['Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Notion', 'Figma', 'OpenAI'].map(c => (
            <span key={c} style={{ fontSize: 13, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ {c}</span>
          ))}
          {['Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Notion', 'Figma', 'OpenAI'].map(c => (
            <span key={c + '2'} style={{ fontSize: 13, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ {c}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE 2: DASHBOARD ───────────────────────────────────────────────────────

export { LandingPage };
