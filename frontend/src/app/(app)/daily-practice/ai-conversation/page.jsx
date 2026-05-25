"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, MicWave } from '@/components/shared';
import { C } from '@/constants/theme';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { analyzeDailyTranscript, sendDailyChat, startDailySession } from '@/services/dailyService';

const StatCard = ({ label, value }) => (
  <GlassCard style={{ padding: 22, minHeight: 112, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
    <div style={{ color: C.textSecondary, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ color: C.textPrimary, fontSize: 26, fontWeight: 800 }}>{value}</div>
  </GlassCard>
);

export default function AIConversationPage() {
  const router = useRouter();
  const [convState, setConvState] = useState('live');
  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [note, setNote] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);
  const utteranceRef = useRef(null);
  const pendingSpeechRef = useRef(null);
  const {
    supported,
    listening,
    transcript,
    error: speechError,
    resetTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({ continuous: false, interimResults: true });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const userTranscript = useMemo(
    () => history.filter((turn) => turn.role === 'user').map((turn) => turn.text).join(' '),
    [history]
  );

  const cancelSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    pendingSpeechRef.current = null;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
  };

  const speak = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    cancelSpeech();

    const doSpeak = () => {
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => {
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setAiSpeaking(false);
      };
      utterance.onerror = () => {
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setAiSpeaking(false);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      pendingSpeechRef.current = text;
      window.speechSynthesis.onvoiceschanged = () => {
        if (!pendingSpeechRef.current) return;
        const pending = pendingSpeechRef.current;
        pendingSpeechRef.current = null;
        doSpeak(pending);
      };
      return;
    }

    doSpeak(text);
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const started = await startDailySession({ mode: 'ai-conversation' });
        if (!active) return;
        setSessionId(started.sessionId);
        const opener = await sendDailyChat({ sessionId: started.sessionId, message: '', history: [] });
        if (!active) return;
        const aiText = opener?.aiResponse || 'Hi, I am Bravely. What would you like to practice today?';
        setHistory([{ role: 'ai', text: aiText }]);
        if (opener?.source === 'fallback') setNote('AI service offline. Using fallback conversation coach.');
        speak(aiText);
      } catch {
        if (!active) return;
        const fallback = 'Hi, I am Bravely. What is one conversation you want to handle more confidently this week?';
        setHistory([{ role: 'ai', text: fallback }]);
        setNote('Backend unavailable. Conversation will use local fallback where possible.');
      }
    };

    bootstrap();
    return () => {
      active = false;
      cancelSpeech();
    };
  }, []);

  const handleUserTurn = async () => {
    if (listening) {
      stopListening();
      const message = transcript.trim();
      if (!message) return;
      const nextHistory = [...history, { role: 'user', text: message }];
      setHistory(nextHistory);
      resetTranscript();
      try {
        const result = await sendDailyChat({ sessionId, message, history: nextHistory });
        const aiText = result.aiResponse;
        setHistory([...nextHistory, { role: 'ai', text: aiText }]);
        if (result?.source === 'fallback') setNote('AI service offline. Using fallback conversation coach.');
        speak(aiText);
      } catch (err) {
        const fallback = 'Tell me one specific detail about that moment, and what you wanted the listener to understand.';
        setHistory([...nextHistory, { role: 'ai', text: fallback }]);
        setNote(err?.message || 'Unable to reach AI conversation. Using fallback reply.');
        speak(fallback);
      }
      return;
    }

    setNote('');
    resetTranscript();
    startListening();
  };

  const handleEnd = async () => {
    stopListening();
    cancelSpeech();
    setConvState('ended');
  };

  const handleGetFeedback = async () => {
    setConvState('feedback');
    setNote('');
    try {
      const result = await analyzeDailyTranscript({
        sessionId,
        mode: 'ai-conversation',
        transcript: userTranscript,
        duration: Math.round((Date.now() - startedAt) / 1000),
      });
      setAnalysis(result);
      if (result?.source === 'fallback') setNote('AI service offline. Showing local fallback feedback.');
    } catch (err) {
      setNote(err?.message || 'Unable to generate call feedback.');
    }
  };

  const scores = analysis?.scores || {};
  const metrics = analysis?.metrics || {};
  const fillers = analysis?.analysis?.filler_words?.detected || [];
  const fillerTotal = fillers.reduce((sum, item) => sum + (item.count || 0), 0);
  const lastAi = [...history].reverse().find((turn) => turn.role === 'ai')?.text;

  return (
    <div style={{ padding: '32px 32px 60px', maxWidth: 1100, margin: '0 auto', color: C.textPrimary, display: 'flex', flexDirection: 'column', gap: 30 }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(.85); opacity:.6; } 100% { transform: scale(1.5); opacity:0; } }
        @keyframes mic-recording { 0%,100% { box-shadow: 0 0 40px rgba(167,139,250,.5); transform: scale(1); } 40% { box-shadow: 0 0 85px rgba(167,139,250,.85); transform: scale(1.08); } }
        @keyframes ai-speaking { 0%,100% { box-shadow: 0 0 35px rgba(16,185,129,.45); transform: scale(1); } 50% { box-shadow: 0 0 70px rgba(16,185,129,.75); transform: scale(1.05); } }
        @keyframes shimmer { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
        .mic-user { animation: mic-recording 1.8s ease-in-out infinite; }
        .mic-ai { animation: ai-speaking 2.4s ease-in-out infinite; background: linear-gradient(135deg,#10B981,#059669) !important; }
      `}</style>

      {convState === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 34, margin: 0 }}>On a Call</h1>
              <p style={{ color: C.textSecondary, margin: '8px 0 0' }}>Tap the mic to speak. Tap again to send your turn to the AI.</p>
            </div>
            <NeonButton variant="outline" onClick={handleEnd} style={{ borderColor: C.error || '#EF4444', color: C.error || '#EF4444' }}>End Call</NeonButton>
          </div>

          <GlassCard style={{ width: '100%', maxWidth: 760, padding: '44px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 500 }}>
            <div style={{ minHeight: 92, textAlign: 'center', maxWidth: 620 }}>
              {aiSpeaking ? (
                <div style={{ color: C.success || '#10B981', fontWeight: 800, animation: 'shimmer 1.5s infinite' }}>AI Responding</div>
              ) : (
                <h3 style={{ margin: 0, fontSize: 22 }}>{listening ? 'The AI is listening...' : 'Ready for your next turn'}</h3>
              )}
              <p style={{ color: C.textSecondary, lineHeight: 1.6 }}>{listening ? (transcript || 'Speak naturally...') : lastAi}</p>
            </div>

            <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${aiSpeaking ? 'rgba(16,185,129,.3)' : 'rgba(167,139,250,.3)'}`, animation: 'pulse-ring 3s infinite', pointerEvents: 'none' }} />
              <button
                type="button"
                onClick={handleUserTurn}
                disabled={aiSpeaking}
                className={aiSpeaking ? 'mic-ai' : listening ? 'mic-user' : ''}
                style={{ width: 152, height: 152, borderRadius: '50%', border: 0, cursor: aiSpeaking ? 'default' : 'pointer', color: '#fff', fontSize: 48, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, zIndex: 2 }}
              >
                {aiSpeaking ? '📞' : '🎙️'}
              </button>
            </div>
            <MicWave active={listening || aiSpeaking} color={aiSpeaking ? '#10B981' : undefined} />
            {(() => {
              const showWarning = note || (hydrated && (speechError || !supported));
              const message = !supported
                ? 'Speech recognition is unavailable in this browser. Use Chrome or Edge.'
                : (speechError || note || '');
              return (
                <div
                  style={{
                    marginTop: 18,
                    color: C.warning || '#F59E0B',
                    fontSize: 13,
                    minHeight: 18,
                    visibility: showWarning ? 'visible' : 'hidden',
                  }}
                >
                  {showWarning ? message : ''}
                </div>
              );
            })()}
          </GlassCard>

          <GlassCard style={{ width: '100%', maxWidth: 760, padding: 22, maxHeight: 230, overflow: 'auto' }}>
            <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 14 }}>Conversation Transcript</div>
            {history.map((turn, index) => (
              <div key={`${turn.role}-${index}`} style={{ color: turn.role === 'ai' ? C.primary : C.textPrimary, marginBottom: 10, lineHeight: 1.5 }}>
                <strong>{turn.role === 'ai' ? 'AI' : 'You'}:</strong> {turn.text}
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {convState === 'ended' && (
        <GlassCard style={{ margin: '40px auto 0', padding: '70px 40px', maxWidth: 620, textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 18 }}>📞</div>
          <h2 style={{ fontSize: 32, margin: '0 0 12px' }}>Call Ended</h2>
          <p style={{ color: C.textSecondary, fontSize: 17, marginBottom: 34 }}>{history.filter((turn) => turn.role === 'user').length} user turns captured.</p>
          <NeonButton variant="primary" onClick={handleGetFeedback} style={{ padding: '15px 34px', fontSize: 18 }}>Generate AI Feedback</NeonButton>
        </GlassCard>
      )}

      {convState === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 34, marginBottom: 8 }}>Call Feedback</h2>
            <p style={{ color: C.textSecondary }}>{analysis ? 'Feedback generated from your spoken turns.' : 'Generating feedback...'}</p>
            {note && <p style={{ color: C.warning || '#F59E0B', fontSize: 13 }}>{note}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            <StatCard label="Confidence" value={`${Math.round(scores.confidence_score || 0)}/100`} />
            <StatCard label="Clarity" value={`${Math.round(scores.clarity_score || 0)}/100`} />
            <StatCard label="Pace" value={`${Math.round(metrics.words_per_minute || 0)} WPM`} />
            <StatCard label="Vocabulary" value={`${Math.round(scores.vocabulary_score || 0)}/100`} />
            <StatCard label="Fillers" value={fillerTotal} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <GlassCard style={{ padding: 28, borderTop: `4px solid ${C.success || '#10B981'}` }}>
              <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Areas of Strength</div>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {(analysis?.feedback?.strengths || ['You completed a live AI conversation turn loop.']).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </GlassCard>
            <GlassCard style={{ padding: 28, borderTop: `4px solid ${C.warning || '#F59E0B'}` }}>
              <div style={{ color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Opportunities for Growth</div>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {(analysis?.feedback?.improvements || ['Add longer spoken turns for richer feedback.']).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </GlassCard>
          </div>
          <GlassCard style={{ padding: 26 }}>
            <div style={{ color: C.primary, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>Key Takeaway</div>
            <p style={{ color: C.textPrimary, lineHeight: 1.7, margin: 0 }}>{analysis?.feedback?.actionable_tip || analysis?.analysis?.communication_quality || 'Speak for at least one complete turn to receive a specific takeaway.'}</p>
          </GlassCard>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <NeonButton variant="outline" onClick={() => router.push('/daily-practice')}>Back to Daily Practice</NeonButton>
            <NeonButton variant="primary" onClick={() => { setConvState('live'); setAnalysis(null); setHistory([{ role: 'ai', text: 'Hi, I am Bravely. What would you like to practice next?' }]); resetTranscript(); }}>Start Another Call</NeonButton>
          </div>
        </div>
      )}
    </div>
  );
}
