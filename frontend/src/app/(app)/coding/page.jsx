"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton } from '@/components/shared';
import CodingSession from '../solo-session/CodingSession';

const REQUIRED_CONFIG_KEYS = ['role', 'roleId', 'experienceLevel', 'interviewRound', 'interviewContext'];

function readSessionConfig() {
  try {
    const raw = sessionStorage.getItem('aia_session_config');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function isValidConfig(config) {
  if (!config) return false;
  if (config.interviewRound !== 'coding') return false;
  return REQUIRED_CONFIG_KEYS.every((k) => typeof config[k] === 'string' && config[k].trim().length > 0);
}

function readSessionResume() {
  try {
    const raw = sessionStorage.getItem('aia_session_resume');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default function CodingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState('booting');
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [resume, setResume] = useState(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setPhase('booting');
      setError('');

      const nextConfig = readSessionConfig();
      const nextResume = readSessionResume();

      if (!isValidConfig(nextConfig)) {
        setError('Your coding interview setup is incomplete or invalid. Please reconfigure and try again.');
        setPhase('failed');
        return;
      }

      if (cancelled) return;
      setConfig(nextConfig);
      setResume(nextResume);

      setPhase('preparing');
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      setPhase('generating');
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;

      setPhase('initializing');
      await new Promise((r) => setTimeout(r, 650));
      if (cancelled) return;

      setPhase('ready');
    };

    boot().catch(() => {
      if (!cancelled) {
        setError('We could not initialize the coding interview environment. Please try again.');
        setPhase('failed');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runId]);

  const loadingLabel = useMemo(() => {
    if (phase === 'preparing') return 'Preparing Coding Environment...';
    if (phase === 'generating') return 'Generating Problem...';
    if (phase === 'initializing') return 'Initializing AI Interviewer...';
    return 'Starting Coding Interview...';
  }, [phase]);

  if (phase === 'ready' && config) {
    return <CodingSession config={config} resume={resume} />;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 30% 20%, rgba(167,139,250,0.2), rgba(10,13,20,1) 45%)',
        padding: 20,
      }}
    >
      <GlassCard
        style={{
          width: 'min(560px, 100%)',
          padding: 28,
          border: `1px solid ${phase === 'failed' ? C.error : C.borderMid}`,
          boxShadow: phase === 'failed' ? `0 0 28px ${C.error}33` : `0 0 28px ${C.primary}22`,
        }}
      >
        {phase !== 'failed' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `3px solid ${C.borderMid}`,
                  borderTopColor: C.primary,
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary }}>{loadingLabel}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Launching immersive coding mode...</div>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: phase === 'preparing' ? '35%' : phase === 'generating' ? '70%' : '92%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`,
                  boxShadow: `0 0 16px ${C.primary}66`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.error, marginBottom: 8 }}>Unable to Start Coding Round</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 18 }}>{error}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <NeonButton size="sm" onClick={() => setRunId((id) => id + 1)}>Retry</NeonButton>
              <NeonButton size="sm" variant="outline" onClick={() => router.push('/solo-select')}>Return to Setup</NeonButton>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
