"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '@/components/shared';
import { api, ApiError } from '@/lib/api';
import { useRecorder, audioForm } from '@/lib/useRecorder';
import styles from './SoloSession.module.css';

const CameraPreview = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    let stream;
    navigator.mediaDevices?.getUserMedia({ video: true }).then((s) => {
      stream = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    }).catch(() => { /* camera is optional: practice works with audio only */ });
    return () => stream?.getTracks().forEach((t) => t.stop());
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
    'Describe how you would find the top users by engagement and what you would check first.',
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

const DEFAULT_CONFIG = { role: 'Software Engineer', roleId: 'se', interviewRound: 'technical' };
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const messageFor = (err) => (err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');

const SoloPage = () => {
  const router = useRouter();
  const [config] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const saved = sessionStorage.getItem('aia_session_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    if (config?.interviewRound === 'coding') router.replace('/coding');
  }, [config?.interviewRound, router]);

  const roleName = config.role || DEFAULT_CONFIG.role;
  const questions = questionBank[config.roleId] || questionBank.se;

  const [qIndex, setQIndex] = useState(0);
  // idle -> (recording) -> processing -> reviewed
  const [phase, setPhase] = useState('idle');
  const [answers, setAnswers] = useState([]);
  const [last, setLast] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [time, setTime] = useState(0);
  const processRef = useRef(null);
  const recorder = useRecorder({ onAutoStop: (rec) => processRef.current?.(rec) });

  useEffect(() => {
    const t = setInterval(() => setTime((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // The interviewer reads the question aloud with the browser's built-in voice. It is optional:
  // when speech synthesis is missing, the question is still shown as text.
  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    speak(questions[qIndex]);
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); };
  }, [qIndex, questions, speak]);

  const processRecording = useCallback(async (rec) => {
    if (!rec) { setPhase('idle'); return; }
    setPhase('processing');
    setError(null);
    try {
      const form = audioForm(rec.blob);
      const result = await api('/api/ai/transcribe', { method: 'POST', body: form });
      const answer = { question: questions[qIndex], transcript: result.transcript, durationSec: rec.durationSec, metrics: result.metrics, fluency: result.fluency, notice: result.notice };
      setLast(answer);
      setAnswers((prev) => [...prev, answer]);
      setPhase('reviewed');
    } catch (err) {
      setError(messageFor(err));
      setPhase('idle');
    }
  }, [questions, qIndex]);

  useEffect(() => { processRef.current = processRecording; }, [processRecording]);

  const finishRecording = useCallback(async () => processRecording(await recorder.stop()), [processRecording, recorder]);

  const toggleMic = async () => {
    setError(null);
    if (phase === 'recording') return finishRecording();
    if (phase === 'processing') return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const ok = await recorder.start();
    if (ok) setPhase('recording');
  };

  const nextQuestion = () => {
    setLast(null);
    setPhase('idle');
    setQIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const endSession = async () => {
    if (phase === 'recording') await recorder.stop();
    if (!answers.length) return router.push('/solo-select');
    setSaving(true);
    setError(null);
    const transcript = answers.map((a) => a.transcript).join(' ');
    const durationSec = Math.round(answers.reduce((s, a) => s + (a.durationSec || 0), 0));
    try {
      // One judgement over the whole session. If the model is unavailable the session is still
      // saved with measured metrics only, and the report says so.
      let feedback = null;
      try {
        feedback = (await api('/api/ai/evaluate', { method: 'POST', body: { transcript, mode: 'interview', durationSec } })).feedback;
      } catch { /* degraded: save without model feedback */ }
      await api('/api/sessions', { method: 'POST', body: { transcript, mode: 'interview', topic: roleName, durationSec, feedback } });
      router.push('/report');
    } catch (err) {
      setError(`${messageFor(err)} Your answers are still on screen. Try ending the session again.`);
      setSaving(false);
    }
  };

  const stageRef = useRef(null);
  const [avatarSize, setAvatarSize] = useState(240);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setAvatarSize(Math.round(Math.max(140, Math.min(480, Math.min(width, height) * 0.72))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const recording = phase === 'recording';
  const processing = phase === 'processing';
  const m = last?.metrics;
  const f = last?.fluency;
  const tiles = [
    { l: 'Pace', v: m?.wpm ? `${m.wpm} wpm` : '—', note: m?.wpm ? m.pace : 'Answer to see' },
    { l: 'Fillers', v: m ? `${m.fillers.counted}` : '—', note: m ? 'at least (often undercounted)' : 'Answer to see' },
    { l: 'Fluency', v: f?.score != null ? `${f.score}` : '—', note: f?.score != null ? `${f.range[0]}–${f.range[1]} · ${f.band}` : (f?.reason ? 'Too short to score' : 'Answer to see') },
  ];
  const status = recording ? `Recording ${fmt(recorder.seconds)}` : processing ? 'Transcribing your answer…' : speaking ? 'Interviewer is speaking' : phase === 'reviewed' ? 'Review your answer' : 'Press the mic and answer';
  const isLast = qIndex === questions.length - 1;

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div className={styles.group}>
          <GlassCard style={{ padding: '8px 16px' }}>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'JetBrains Mono' }}>
              {roleName} · AI interviewer
            </span>
          </GlassCard>
        </div>
        <div className={styles.group}>
          <GlassCard style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: recording ? C.error : C.textMuted, animation: recording ? 'pulse-ring 1s ease infinite' : 'none' }} />
            <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: recording ? C.error : C.textSecondary }}>
              {recording ? 'REC' : 'SESSION'} {fmt(recording ? recorder.seconds : time)}
            </span>
          </GlassCard>
          <Tag color={C.warning}>Question {qIndex + 1} of {questions.length}</Tag>
        </div>
      </div>

      <div className={styles.metrics} aria-live="polite">
        {tiles.map(({ l, v, note }) => (
          <GlassCard key={l} style={{ padding: '12px 16px', minWidth: 120 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: 'JetBrains Mono' }}>{v}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{note}</div>
          </GlassCard>
        ))}
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.avatar}>
          <AIAvatar size={avatarSize} speaking={speaking} />
        </div>
        <CameraPreview />
      </div>

      <div className={styles.caption}>
        <GlassCard style={{ padding: '16px clamp(16px, 3vw, 32px)', textAlign: 'center' }}>
          <div className={styles.captionLabel} role="status">{status}</div>
          <p className={styles.question}>&quot;{questions[qIndex]}&quot;</p>
          {last && (
            <div className={styles.result}>
              <p className={styles.transcript}><strong>You said:</strong> {last.transcript}</p>
              {f?.score == null && f?.reason && <p className={styles.hint}>{f.reason}</p>}
              <p className={styles.notice}>{last.notice}</p>
            </div>
          )}
          {(error || recorder.error) && <p className={styles.error} role="alert">{error || recorder.error}</p>}
        </GlassCard>
      </div>

      <div className={styles.controls}>
        <GlassCard className={styles.controlsInner}>
          <MicWave active={recording} />
          <button
            type="button"
            onClick={toggleMic}
            disabled={processing || saving}
            aria-pressed={recording}
            aria-label={recording ? 'Stop recording' : 'Start recording your answer'}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: processing || saving ? 'not-allowed' : 'pointer',
              background: recording ? C.error : 'var(--accent)',
              color: 'var(--bv-s0)', fontSize: 18, opacity: processing || saving ? 0.5 : 1, transition: 'background-color .15s',
            }}
          >{recording ? '■' : '🎙'}</button>
          {phase === 'reviewed' && !isLast && <NeonButton size="sm" onClick={nextQuestion}>Next question</NeonButton>}
          <NeonButton size="sm" onClick={endSession} disabled={saving || processing}>
            {saving ? 'Saving…' : answers.length ? (isLast && phase === 'reviewed' ? 'Finish & see report' : 'End & see report') : 'Leave'}
          </NeonButton>
        </GlassCard>
      </div>
    </div>
  );
};

export default SoloPage;
