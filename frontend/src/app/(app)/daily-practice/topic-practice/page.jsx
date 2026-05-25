"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, MicWave } from '@/components/shared';
import { C } from '@/constants/theme';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { analyzeDailyTranscript, generateDailyTopic, startDailySession } from '@/services/dailyService';

const StatCard = ({ label, value }) => (
  <GlassCard style={{ padding: 22, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
    <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 26, color: C.textPrimary, fontWeight: 800 }}>{value}</div>
  </GlassCard>
);

const StarPill = ({ label, value, active }) => {
  const status = active ? 'Listening...' : value >= 70 ? 'Detected' : value >= 45 ? 'Partial' : value > 0 ? 'Missing' : 'Pending';
  const color = active ? C.primary : value >= 70 ? (C.success || '#10B981') : value >= 45 ? (C.warning || '#F59E0B') : value > 0 ? (C.error || '#EF4444') : C.textMuted;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 16px', border: `1px solid ${color}`, borderRadius: 8, marginBottom: 10 }}>
      <span style={{ color: C.textPrimary }}>{label}</span>
      <span style={{ color, fontSize: 12, textTransform: 'uppercase', fontWeight: 800 }}>{status}</span>
    </div>
  );
};

const STAR_HINTS = {
  situation: ['when', 'while', 'context', 'situation', 'at the time', 'during'],
  task: ['needed to', 'had to', 'goal', 'responsible', 'task', 'objective'],
  action: ['i did', 'i decided', 'i led', 'i built', 'i implemented', 'i created', 'i drove'],
  result: ['result', 'impact', 'outcome', 'increased', 'reduced', 'improved', '%', 'percent'],
};

function scoreFromHints(text, hints) {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const hint of hints) {
    if (lower.includes(hint)) hits += 1;
  }
  if (hits === 0) return 0;
  if (hits === 1) return 45;
  if (hits === 2) return 70;
  return 85;
}

export default function TopicPracticePage() {
  const router = useRouter();
  const [topicState, setTopicState] = useState('initial');
  const [recState, setRecState] = useState('idle');
  const [showFeedback, setShowFeedback] = useState(false);
  const [topic, setTopic] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [note, setNote] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const {
    supported,
    listening,
    transcript,
    error: speechError,
    resetTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const isIdle = recState === 'idle';
  const isRecording = recState === 'recording';
  const isProcessing = recState === 'processing';
  const isDone = recState === 'done';
  const scores = analysis?.scores || {};
  const metrics = analysis?.metrics || {};
  const liveStar = useMemo(() => {
    const text = transcript || '';
    return {
      situation: scoreFromHints(text, STAR_HINTS.situation),
      task: scoreFromHints(text, STAR_HINTS.task),
      action: scoreFromHints(text, STAR_HINTS.action),
      result: scoreFromHints(text, STAR_HINTS.result),
    };
  }, [transcript]);
  const star = (isRecording || (transcript && !analysis)) ? liveStar : (analysis?.analysis?.star_structure || {});
  const fillers = analysis?.analysis?.filler_words?.detected || [];
  const fillerTotal = fillers.reduce((sum, item) => sum + (item.count || 0), 0);

  const handleGenerateTopic = async () => {
    setTopicState('generating');
    setNote('');
    setAnalysis(null);
    resetTranscript();
    try {
      const [started, generated] = await Promise.all([
        startDailySession({ mode: 'topic-practice' }).catch(() => null),
        generateDailyTopic(),
      ]);
      const nextTopic = generated.topic || generated;
      setSessionId(started?.sessionId || null);
      setTopic(nextTopic);
      if (nextTopic?.source === 'fallback') setNote('AI service offline. Using fallback topic.');
    } catch (err) {
      setTopic({
        source: 'fallback',
        category: 'Leadership & Strategy',
        prompt: 'Describe a time you had to pivot your strategy quickly.',
        guidance: 'Use STAR: Situation, Task, Action, Result.',
      });
      setNote(err?.message || 'Backend unavailable. Using fallback topic.');
    } finally {
      setTopicState('ready');
      setRecState('idle');
    }
  };

  const submitForAnalysis = async () => {
    setRecState('processing');
    setNote('');
    try {
      const result = await analyzeDailyTranscript({
        sessionId,
        mode: 'topic-practice',
        prompt: topic?.prompt,
        transcript,
      });
      setAnalysis(result);
      if (result?.source === 'fallback') setNote('AI service offline. Showing local fallback feedback.');
    } catch (err) {
      setNote(err?.message || 'Unable to generate AI feedback.');
    } finally {
      setRecState('done');
    }
  };

  const handleMicClick = async () => {
    if (isIdle) {
      setShowFeedback(false);
      setAnalysis(null);
      resetTranscript();
      startListening();
      setRecState('recording');
      return;
    }
    if (isRecording) {
      stopListening();
      await submitForAnalysis();
    }
  };

  return (
    <div style={{ padding: '32px 32px 60px', maxWidth: 1100, margin: '0 auto', color: C.textPrimary, display: 'flex', flexDirection: 'column', gap: 30 }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes recording-pulse { 0%,100% { box-shadow: 0 0 40px rgba(167,139,250,.5); transform: scale(1); } 40% { box-shadow: 0 0 80px rgba(167,139,250,.85); transform: scale(1.08); } }
        @keyframes shimmer { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
        .mic-recording { animation: recording-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {topicState === 'initial' || topicState === 'generating' ? (
        <GlassCard style={{ padding: '80px 40px', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(167,139,250,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 24 }}>🎯</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready for your daily challenge?</h2>
          <p style={{ color: C.textSecondary, fontSize: 17, marginBottom: 34, maxWidth: 460 }}>Generate a fresh AI speaking prompt, answer it aloud, and get STAR-based feedback from your transcript.</p>
          <NeonButton variant="primary" onClick={handleGenerateTopic} disabled={topicState === 'generating'} style={{ padding: '16px 40px', fontSize: 17 }}>
            {topicState === 'generating' ? 'Generating Topic...' : "Get Today's Topic"}
          </NeonButton>
        </GlassCard>
      ) : (
        <>
          <GlassCard style={{ padding: 38, position: 'relative', overflow: 'hidden', border: `1px solid ${C.primary}40` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ padding: '5px 12px', borderRadius: 20, color: C.primary, background: 'rgba(167,139,250,.14)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{topic?.category || 'Daily Challenge'}</span>
              <span style={{ color: C.textSecondary, fontSize: 13 }}>{topic?.source === 'fallback' ? 'Offline fallback' : 'AI generated'}</span>
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.25, margin: 0, color: '#fff' }}>&quot;{topic?.prompt}&quot;</h1>
            <p style={{ color: C.textSecondary, fontSize: 16, lineHeight: 1.6, maxWidth: 780 }}>{topic?.guidance}</p>
            {note && <div style={{ color: C.warning || '#F59E0B', fontSize: 13 }}>{note}</div>}
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
            <GlassCard style={{ padding: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <div style={{ height: 54, textAlign: 'center' }}>
                {isIdle && <><h3 style={{ margin: 0 }}>Tap to Start Speaking</h3><p style={{ color: C.textSecondary, margin: '6px 0 0' }}>Your AI coach will analyze your structure.</p></>}
                {isRecording && <div style={{ color: C.error || '#EF4444', fontWeight: 800, textTransform: 'uppercase', animation: 'shimmer 1.5s infinite' }}>Live Recording</div>}
                {(isProcessing || isDone) && <div style={{ color: C.primary, fontWeight: 800 }}>{isProcessing ? 'Analyzing Structure...' : 'Analysis Complete'}</div>}
              </div>
              <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(isIdle || isRecording) && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(167,139,250,.28)', animation: 'pulse-ring 3s infinite', pointerEvents: 'none' }} />}
                <button
                  type="button"
                  className={isRecording ? 'mic-recording' : ''}
                  onClick={handleMicClick}
                  disabled={isProcessing || isDone}
                  style={{ width: 135, height: 135, borderRadius: '50%', border: 0, cursor: isIdle || isRecording ? 'pointer' : 'default', color: '#fff', fontSize: 44, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, zIndex: 2 }}
                >
                  🎙️
                </button>
              </div>
              <MicWave active={isRecording} />
              <div style={{ width: '100%', color: C.textSecondary, fontSize: 13 }}>{listening ? 'Listening' : isProcessing ? 'Processing' : 'Ready'}</div>
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <GlassCard style={{ padding: 24, minHeight: 230 }}>
                <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 14 }}>Live Transcript</div>
                <div style={{ color: transcript ? C.textPrimary : C.textMuted, lineHeight: 1.7, minHeight: 110 }}>{transcript || 'Your spoken response will appear here...'}</div>
                {(() => {
                  const showWarning = hydrated && (speechError || !supported);
                  const message = !supported
                    ? 'Speech recognition is unavailable in this browser. Use Chrome or Edge.'
                    : (speechError || '');
                  return (
                    <div
                      style={{
                        color: C.warning || '#F59E0B',
                        fontSize: 13,
                        marginTop: 12,
                        minHeight: 18,
                        visibility: showWarning ? 'visible' : 'hidden',
                      }}
                    >
                      {showWarning ? message : ''}
                    </div>
                  );
                })()}
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 16 }}>Real-Time STAR Tracking</div>
                <StarPill label="Situation" value={star.situation || 0} active={isRecording} />
                <StarPill label="Task" value={star.task || 0} active={isRecording} />
                <StarPill label="Action" value={star.action || 0} active={isRecording} />
                <StarPill label="Result" value={star.result || 0} active={isRecording} />
                {!showFeedback && isDone && <NeonButton variant="primary" onClick={() => setShowFeedback(true)} style={{ width: '100%', marginTop: 16 }}>Get AI Feedback</NeonButton>}
              </GlassCard>
            </div>
          </div>

          {showFeedback && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
                <StatCard label="STAR Score" value={`${Math.round(scores.star_score || 0)}/100`} />
                <StatCard label="Clarity" value={`${Math.round(scores.clarity_score || 0)}/100`} />
                <StatCard label="Fillers" value={fillerTotal} />
                <StatCard label="Pace" value={`${Math.round(metrics.words_per_minute || 0)} WPM`} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <GlassCard style={{ padding: 24, borderLeft: `4px solid ${C.success || '#10B981'}` }}>
                  <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Strength</div>
                  <h3 style={{ marginTop: 0 }}>{analysis?.feedback?.strengths?.[0] || 'Clear Focus'}</h3>
                  <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>{analysis?.analysis?.clarity || 'Your strongest speaking signal will appear here.'}</p>
                </GlassCard>
                <GlassCard style={{ padding: 24, borderLeft: `4px solid ${C.warning || '#F59E0B'}` }}>
                  <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Next Step</div>
                  <h3 style={{ marginTop: 0 }}>{analysis?.feedback?.improvements?.[0] || 'Add Outcomes'}</h3>
                  <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>{analysis?.feedback?.actionable_tip || analysis?.analysis?.star_structure?.feedback}</p>
                </GlassCard>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <NeonButton variant="outline" onClick={() => router.push('/daily-practice')}>Back to Daily Practice</NeonButton>
                <NeonButton variant="primary" onClick={() => { setRecState('idle'); setShowFeedback(false); setTopicState('initial'); setAnalysis(null); resetTranscript(); }}>Try Another Topic</NeonButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
