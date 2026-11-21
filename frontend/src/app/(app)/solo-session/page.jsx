"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '@/components/shared';
import styles from './SoloSession.module.css';

const CameraPreview = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    }).catch(console.error);
  }, []);
  return (
    <div className={styles.camera}>
      <video ref={videoRef} autoPlay playsInline muted />
      <div className={styles.cameraTag}>You</div>
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
  const [config] = useState(() => {
    if (typeof window === 'undefined') {
      return { role: 'Software Engineer', roleId: 'se', interviewRound: 'technical' };
    }
    try {
      const saved = sessionStorage.getItem('aia_session_config');
      return saved ? JSON.parse(saved) : { role: 'Software Engineer', roleId: 'se', interviewRound: 'technical' };
    } catch {
      return { role: 'Software Engineer', roleId: 'se', interviewRound: 'technical' };
    }
  });

  useEffect(() => {
    if (config?.interviewRound === 'coding') {
      router.replace('/coding');
    }
  }, [config?.interviewRound, router]);

  const roleName = config.role || 'Software Engineer';
  const roleId = config.roleId || 'se';

  const [questions, setQuestions] = useState(questionBank[roleId] || questionBank['se']);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setQuestions(questionBank[roleId] || questionBank['se']);
      setCurrentQ(0);
    }, 0);
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

  // Size the avatar from the space the stage actually has, so nothing can run off screen.
  const stageRef = useRef(null);
  const [avatarSize, setAvatarSize] = useState(240);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      // 0.72 leaves room for the avatar's glow ring and data labels.
      setAvatarSize(Math.round(Math.max(140, Math.min(480, Math.min(width, height) * 0.72))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div className={styles.group}>
          <GlassCard style={{ padding: '8px 16px' }}>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'JetBrains Mono' }}>
              Senior {roleName} · Ai Arena
            </span>
          </GlassCard>
        </div>
        <div className={styles.group}>
          <GlassCard style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.error, animation: 'pulse-ring 1s ease infinite' }} />
            <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: C.error }}>REC {fmt(time)}</span>
          </GlassCard>
          <Tag color={C.warning}>Question 2 of 6</Tag>
        </div>
      </div>

      {/* AI metrics */}
      <div className={styles.metrics}>
        {[{ l: 'Engagement', v: 87 }, { l: 'Pace', v: 72 }, { l: 'Clarity', v: 91 }].map(({ l, v }) => (
          <GlassCard key={l} style={{ padding: '12px 16px', minWidth: 110 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${v}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: 'JetBrains Mono' }}>{v}%</div>
          </GlassCard>
        ))}
      </div>

      {/* Stage: avatar, feedback chip, camera */}
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.avatar}>
          <AIAvatar size={avatarSize} speaking={speaking} />
        </div>
        {feedback && (
          <div className={styles.feedback} style={{ animation: 'fade-up 0.3s ease' }}>
            <GlassCard style={{ padding: '10px 18px', border: `1px solid ${feedback.color}40` }}>
              <span style={{ fontSize: 13, color: feedback.color }}>✓ {feedback.text}</span>
            </GlassCard>
          </div>
        )}
        <CameraPreview />
      </div>

      {/* Question */}
      <div className={styles.caption}>
        <GlassCard style={{ padding: '16px clamp(16px, 3vw, 32px)', textAlign: 'center' }}>
          <div className={styles.captionLabel}>
            {speaking ? '▶ AI Speaking' : '⏸ Waiting for your response'}
          </div>
          <p className={styles.question}>
            &quot;Tell me about a time you had to lead a cross-functional team through a difficult technical decision.&quot;
          </p>
        </GlassCard>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <GlassCard className={styles.controlsInner}>
          <MicWave active={micOn} />
          <button
            type="button"
            onClick={() => setMicOn(x => !x)}
            aria-pressed={micOn}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: micOn ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              color: micOn ? 'var(--bv-s0)' : '#fff', fontSize: 18, transition: 'background-color .15s',
            }}
          >🎙</button>
          <NeonButton size="sm" onClick={() => router.push('/report')}>End Session</NeonButton>
        </GlassCard>
      </div>
    </div>
  );
};

// ─── PAGE 4: MOCK INTERVIEW ───────────────────────────────────────────────────

export default SoloPage;
