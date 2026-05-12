"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '../components/shared';
import { Users, Mic } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  // TODO: Reactivate AuthContext when it's fully migrated
  // const { isAuthenticated } = useAuth();
  const isAuthenticated = false; // Mocking for now to render the UI

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
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
        borderBottom: `1px solid ${C.borderMid}`,
        background: 'rgba(7, 8, 22, 0.7)',
        backdropFilter: 'blur(24px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/Bravely-logo.png" alt="Bravely" style={{ height: 44, objectFit: 'contain' }} />
          <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Bravely</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <NeonButton variant="ghost" size="sm">Features</NeonButton>
          <NeonButton variant="ghost" size="sm">Pricing</NeonButton>
          <NeonButton variant="outline" size="sm" onClick={() => router.push('/auth')}>Sign In</NeonButton>
          <NeonButton size="sm" onClick={() => router.push('/auth')}>Get Started →</NeonButton>
        </div>
      </div>
      
      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 80px', gap: 80 }}>
        {/* Left text */}
        <div style={{ flex: 1, maxWidth: 520, animation: 'fade-up 0.8s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, boxShadow: `0 0 10px ${C.primary}` }} />
            <span style={{ fontSize: 13, color: C.primary, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>LIVE — AI Engine Online</span>
          </div>
          <h1 style={{
            fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            background: `linear-gradient(135deg, #ffffff 30%, ${C.primary} 70%, ${C.secondary} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textWrap: 'balance',
            letterSpacing: '-0.02em'
          }}>
            Master Difficult Conversations
          </h1>
          <p style={{ fontSize: 18, color: C.textSecondary, lineHeight: 1.6, marginBottom: 36, fontWeight: 400 }}>
            An immersive AI-driven platform with real-time analytics, dynamic feedback, and luminal precision. 
            Prepare, practice, and perform with confidence.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <NeonButton size="lg" onClick={() => router.push('/dashboard')}>Start Free Session</NeonButton>
            <NeonButton variant="outline" size="lg" onClick={() => router.push('/peer-practice')} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Users size={18} /> Peer Lobby</NeonButton>
            <NeonButton variant="ghost" size="lg" onClick={() => router.push('/auth')}>Sign In →</NeonButton>
          </div>
          
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[['50K+', 'Sessions'], ['94%', 'Success Rate'], ['200+', 'Scenarios']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.primary }}>{n}</div>
                <div style={{ fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right: Avatar/Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, animation: 'fade-up 0.8s ease 0.2s both' }}>
          <AIAvatar size={320} speaking={speaking} />
          
          {/* Speaking indicator */}
          <GlassCard style={{ padding: '16px 28px', textAlign: 'center', minWidth: 280 }}>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 8 }}>
              {speaking ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mic size={14} /> AI is analyzing...</span> : '"Let\'s begin the simulation"'}
            </div>
            <MicWave active={speaking} />
          </GlassCard>
          
          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Visual Analytics', 'Intelligence Feed', 'Luminal UI', 'Real-time Stats'].map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom ticker */}
      <div style={{ borderTop: `1px solid ${C.borderMid}`, padding: '12px 0', overflow: 'hidden', background: 'rgba(7, 8, 22, 0.8)' }}>
        <div style={{ display: 'inline-flex', gap: 60, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
          {['Stripe', 'Linear', 'Apple', 'Bravely', 'Vercel', 'OpenAI', 'Google', 'Anthropic'].map(c => (
            <span key={c} style={{ fontSize: 13, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ {c}</span>
          ))}
          {['Stripe', 'Linear', 'Apple', 'Bravely', 'Vercel', 'OpenAI', 'Google', 'Anthropic'].map(c => (
            <span key={c + '2'} style={{ fontSize: 13, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ {c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
