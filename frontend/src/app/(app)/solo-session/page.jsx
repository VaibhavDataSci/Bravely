"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '@/components/shared';

const CameraPreview = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    }).catch(console.error);
  }, []);
  return (
    <div style={{ position: 'absolute', bottom: 24, right: 24, width: 200, height: 150, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.borderMid}`, background: '#000', boxShadow: `0 4px 20px rgba(0,0,0,0.5)` }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#fff', fontFamily: 'Space Grotesk' }}>You</div>
    </div>
  );
};

const questionBank = {
  'se': [
    'Tell me about a challenging bug you fixed and how you approached it.',
    'How do you handle performance bottlenecks in a web application?',
    'Explain the difference between REST and GraphQL.',
  ],
  'pm': [
    'How do you prioritize features when there are conflicting requests?',
    'Design an elevator system for a blind person.',
    'Tell me about a product you love and how you would improve it.',
  ],
  'da': [
    'Explain p-value to a non-technical stakeholder.',
    'Write a SQL query to find the top 5 users by engagement.',
    'How do you handle missing or corrupt data in a dataset?',
  ],
  'hr': [
    'Tell me about a time you failed and what you learned.',
    'Where do you see your career in 5 years?',
    'How do you handle conflicts with a team member?',
  ],
  'sd': [
    'How would you design a system like Twitter from scratch?',
    'Explain how a load balancer works and when you need one.',
    'Can you explain the CAP theorem and the trade-offs involved?',
  ],
};

// ─── PAGE 3: SOLO INTERVIEW ───────────────────────────────────────────────────
const SoloPage = () => {
  const router = useRouter();
  const [config, setConfig] = useState({ role: 'Software Engineer', roleId: 'se', interviewRound: 'technical' });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('aia_session_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        if (parsed?.interviewRound === 'coding') {
          router.replace('/coding');
        }
      }
    } catch {}
  }, [router]);

  const roleName = config.role || 'Software Engineer';
  const roleId = config.roleId || 'se';

  const [questions, setQuestions] = useState(questionBank[roleId] || questionBank['se']);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    setQuestions(questionBank[roleId] || questionBank['se']);
    setCurrentQ(0);
  }, [roleId]);

  const [speaking, setSpeaking] = React.useState(true);
  const [micOn, setMicOn] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);

  React.useEffect(() => {
    const t = setInterval(() => setTime(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const cycle = () => {
      setSpeaking(true);
      setTimeout(() => {
        setSpeaking(false);
        setFeedback({ text: 'Good eye contact', color: C.success });
        setTimeout(() => setFeedback(null), 2000);
      }, 3500);
    };
    cycle();
    const id = setInterval(cycle, 8000);
    return () => clearInterval(id);
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: '100vh' }}>
      {/* Full-screen avatar bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 60% 40%, #0f1f3d 0%, #030712 70%)`,
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <AIAvatar size={480} speaking={speaking} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 24, left: 24, right: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <GlassCard style={{ padding: '8px 16px' }}>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'JetBrains Mono' }}>
              Senior {roleName} · Ai Arena
            </span>
          </GlassCard>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <GlassCard style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.error, animation: 'pulse-ring 1s ease infinite' }} />
            <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: C.error }}>REC {fmt(time)}</span>
          </GlassCard>
          <Tag color={C.warning}>Question 2 of 6</Tag>
        </div>
      </div>

      {/* Subtitle / question */}
      <div style={{
        position: 'absolute', bottom: 180, left: '50%', transform: 'translateX(-50%)',
        maxWidth: 700, textAlign: 'center', zIndex: 20,
      }}>
        <GlassCard style={{ padding: '20px 36px' }}>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>
            {speaking ? '▶ AI Speaking' : '⏸ Waiting for your response'}
          </div>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, color: C.textPrimary }}>
            "Tell me about a time you had to lead a cross-functional team through a difficult technical decision."
          </p>
        </GlassCard>
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, alignItems: 'center', zIndex: 20,
      }}>
        <GlassCard style={{ padding: '14px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <MicWave active={micOn} />
          <button onClick={() => setMicOn(x => !x)} style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: micOn ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : 'rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 18,
            boxShadow: micOn ? `0 0 24px rgba(167, 139, 250, 0.2)` : 'none',
            transition: 'all 0.3s',
          }}>🎙</button>
          <NeonButton size="sm" onClick={() => router.push('/report')}>End Session</NeonButton>
        </GlassCard>
      </div>

      {/* User camera pip */}
      <CameraPreview />

      {/* AI feedback indicator */}
      {feedback && (
        <div style={{
          position: 'absolute', top: '50%', right: 40,
          transform: 'translateY(-50%)',
          animation: 'fade-up 0.3s ease', zIndex: 20,
        }}>
          <GlassCard style={{ padding: '10px 18px', border: `1px solid ${feedback.color}40` }}>
            <span style={{ fontSize: 13, color: feedback.color }}>✓ {feedback.text}</span>
          </GlassCard>
        </div>
      )}

      {/* Left: AI metrics */}
      <div style={{
        position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 10, zIndex: 20,
      }}>
        {[{ l: 'Engagement', v: 87 }, { l: 'Pace', v: 72 }, { l: 'Clarity', v: 91 }].map(({ l, v }) => (
          <GlassCard key={l} style={{ padding: '12px 16px', minWidth: 130 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${v}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: 'JetBrains Mono' }}>{v}%</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE 4: MOCK INTERVIEW ───────────────────────────────────────────────────

export default SoloPage;
