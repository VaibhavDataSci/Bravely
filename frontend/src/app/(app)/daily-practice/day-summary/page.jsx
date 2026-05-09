"use client";
import React, { useState, useEffect } from 'react';
import { GlassCard, NeonButton, MicWave } from '@/components/shared';
import { C } from '@/constants/theme';

const StatCard = ({ icon, label, value }) => (
  <GlassCard style={{ 
    padding: '24px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    cursor: 'default'
  }} hoverEffect>
    <div style={{ color: C.textSecondary, fontSize: '1.2rem' }}>{icon}</div>
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.textSecondary, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: C.textPrimary, textAlign: 'center' }}>
      {value}
    </div>
  </GlassCard>
);

export default function DaySummaryPage() {
  const [recState, setRecState] = useState('idle'); // 'idle', 'recording', 'processing', 'done'
  const [time, setTime] = useState(180); // 03:00
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    let interval;
    if (recState === 'recording' && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (time === 0 && recState === 'recording') {
      setRecState('processing');
    }
    return () => clearInterval(interval);
  }, [recState, time]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleMicClick = () => {
    if (recState === 'idle') {
      setRecState('recording');
    } else if (recState === 'recording') {
      setRecState('processing');
      // Simulate backend processing time before ready
      setTimeout(() => {
        setRecState('done');
      }, 2000);
    }
  };

  const handleGetFeedback = () => {
    setShowFeedback(true);
  };

  const isIdle = recState === 'idle';
  const isRecording = recState === 'recording';
  const isProcessing = recState === 'processing';
  const isDone = recState === 'done';

  return (
    <div style={{ padding: '0', maxWidth: 1100, margin: '0 auto', color: C.textPrimary, display: 'flex', flexDirection: 'column', gap: 30 }}>
      
      <style>{`
        @keyframes breathe {
          0% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.15), inset 0 0 10px rgba(167, 139, 250, 0.1); transform: scale(1); }
          50% { box-shadow: 0 0 35px rgba(167, 139, 250, 0.3), inset 0 0 20px rgba(167, 139, 250, 0.2); transform: scale(1.03); }
          100% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.15), inset 0 0 10px rgba(167, 139, 250, 0.1); transform: scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes recording-pulse {
          0% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
          20% { box-shadow: 0 0 80px rgba(167, 139, 250, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.4); transform: scale(1.08); }
          100% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
        }
        @keyframes shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .mic-idle { animation: breathe 4s ease-in-out infinite; }
        .mic-recording { animation: recording-pulse 1.8s ease-in-out infinite; }
        .mic-processing { opacity: 0.7; filter: grayscale(50%); transition: all 0.5s; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: C.textSecondary, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Daily Practice <span style={{ margin: '0 8px', color: C.textMuted }}>/</span> Day Summary
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Day Summary</h1>
          <p style={{ color: C.textSecondary, fontSize: '1.05rem' }}>Reflect on your day and improve natural communication clarity.</p>
        </div>
      </div>

      {/* TOP: 2 COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* LEFT: RECORDING PANEL */}
        <GlassCard style={{ 
          padding: '50px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          minHeight: 500,
          background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
        }}>
          
          <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            {isIdle && (
              <>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>Tap to Start Speaking</h3>
                <p style={{ color: C.textSecondary, fontSize: '0.95rem' }}>Your AI coach is ready to listen.</p>
              </>
            )}
            
            {isRecording && (
              <>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.1em', 
                  color: C.error || '#EF4444', 
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  animation: 'shimmer 1.5s infinite'
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.error || '#EF4444' }} />
                  Live Recording
                </div>
                <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'monospace', color: C.textPrimary, lineHeight: 1 }}>
                  {formatTime(time)}
                </div>
              </>
            )}

            {(isProcessing || isDone) && (
              <>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: C.primary, animation: isProcessing ? 'shimmer 1.5s infinite' : 'none' }}>
                  {isProcessing ? 'Generating AI Feedback...' : 'Session Completed'}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace', color: C.textMuted, marginTop: 8 }}>
                  {formatTime(time)}
                </div>
              </>
            )}
          </div>

          <div style={{ 
            position: 'relative', 
            width: 240, height: 240, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '20px 0'
          }}>
            {/* Outer animated rings */}
            {(isIdle || isRecording) && (
              <>
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  borderRadius: '50%', border: `1px solid rgba(167, 139, 250, 0.3)`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
                  pointerEvents: 'none',
                  display: isIdle ? 'block' : 'none' // only show wide rings in idle to invite click, or recording? Let's show in both
                }} />
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  borderRadius: '50%', border: `1px solid rgba(167, 139, 250, 0.15)`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s',
                  pointerEvents: 'none'
                }} />
              </>
            )}

            <div 
              className={isRecording ? 'mic-recording' : isIdle ? 'mic-idle' : 'mic-processing'}
              style={{ 
                width: 150, height: 150, 
                borderRadius: '50%', 
                background: isIdle 
                  ? `linear-gradient(135deg, rgba(167, 139, 250, 0.7), rgba(139, 92, 246, 0.5))` 
                  : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (isIdle || isRecording) ? 'pointer' : 'default',
                fontSize: '3rem',
                color: isIdle ? 'rgba(255,255,255,0.7)' : '#fff',
                transition: 'all 0.4s ease',
                zIndex: 10
              }} onClick={(isIdle || isRecording) ? handleMicClick : undefined}>
              🎙️
            </div>
          </div>

          <div style={{ height: 60, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isRecording ? 1 : 0, transition: 'opacity 0.4s ease', marginTop: 20 }}>
            <MicWave active={isRecording} />
          </div>
        </GlassCard>

        {/* RIGHT: TRANSCRIPTION & INSIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Transcription */}
          <GlassCard style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', opacity: (isIdle && !showFeedback) ? 0.3 : 1, transition: 'all 0.5s ease', pointerEvents: isIdle ? 'none' : 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, color: C.textPrimary }}>
                <span style={{ color: C.textSecondary }}>≡</span> Live Transcription
              </div>
              <div style={{ fontSize: '0.75rem', color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ 
                  width: 6, height: 6, borderRadius: '50%', background: C.primary, 
                  animation: (isRecording || isProcessing) ? 'pulse 1.5s infinite' : 'none',
                  opacity: (isRecording || isProcessing) ? 1 : 0.5
                }} /> {(isRecording || isProcessing) ? 'Processing' : 'Ready'}
              </div>
            </div>

            <div style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 20 }}>
              {!isIdle ? '"...the core challenge of the quarterly review is effectively balancing our ambitious growth targets with the operational constraints we encountered in Q2. I believe the team..."' : 'Waiting for voice input...'}
            </div>
            
            {!isIdle && (
              <div style={{ 
                padding: '20px', 
                background: 'rgba(167, 139, 250, 0.05)', 
                borderRadius: 12, 
                borderLeft: `3px solid ${C.primary}`,
                color: C.textPrimary,
                fontSize: '1.05rem',
                lineHeight: 1.6,
                animation: 'shimmer 1s ease-out 1'
              }}>
                "...needs to prioritize high-leverage activities that align with our long-term strategic vision, <span style={{ color: C.warning }}>specifically</span> focusing on automation and..."
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 30, display: 'flex', gap: 6, opacity: isRecording ? 1 : 0.2 }}>
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
            </div>
          </GlassCard>

          {(!showFeedback && (isDone || isProcessing)) ? (
             <NeonButton 
               variant="primary" 
               onClick={handleGetFeedback}
               style={{ alignSelf: 'flex-start', opacity: isDone ? 1 : 0.5, pointerEvents: isDone ? 'auto' : 'none' }}
             >
               Get AI Feedback
             </NeonButton>
          ) : showFeedback ? (
            /* AI Insight */
            <GlassCard style={{ padding: '24px 30px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 8, 
                background: 'rgba(167, 139, 250, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.primary, flexShrink: 0
              }}>⚡</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.primary, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                  AI Insight
                </div>
                <div style={{ color: C.textPrimary, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  You're using <strong>"specifically"</strong> as a transition word. Consider alternating with <strong>"In particular"</strong> for better vocabulary richness.
                </div>
              </div>
            </GlassCard>
          ) : null}

        </div>
      </div>

      {/* PERFORMANCE PREVIEW SECTION */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Performance Preview</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          <StatCard 
            icon="🚫" 
            label="Filler Words" 
            value={showFeedback ? (
              <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'center' }}>
                <span style={{ color: C.primary }}>uh - 3</span>
                <span style={{ color: C.primary }}>like - 2</span>
              </div>
            ) : "-"} 
          />
          <StatCard 
            icon="⭐" 
            label={<span>Clarity<br/>Score</span>} 
            value={showFeedback ? <span>92<span style={{ fontSize: '1rem', color: C.textSecondary }}>%</span></span> : "-"} 
          />
          <StatCard 
            icon="🧠" 
            label="Tone" 
            value={showFeedback ? <span style={{ fontSize: '1.1rem', color: C.textPrimary }}>Confident</span> : "-"} 
          />
          <StatCard 
            icon="⏱️" 
            label={<span>Pace<br/>(WPM)</span>} 
            value={showFeedback ? "145" : "-"} 
          />
          {showFeedback ? (
            <GlassCard style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(167, 139, 250, 0.05)', border: `1px solid rgba(167, 139, 250, 0.2)` }} hoverEffect>
               <div style={{ color: C.primary, fontSize: '1.2rem' }}>💡</div>
               <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.primary, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>
                 Next Step
               </div>
               <div style={{ fontSize: '0.95rem', fontWeight: 500, color: C.textPrimary, textAlign: 'center' }}>
                 Pause for Impact
               </div>
            </GlassCard>
          ) : (
            <StatCard icon="💡" label="Next Step" value="-" />
          )}
        </div>
      </div>

      {/* BOTTOM INSIGHT BANNER */}
      {showFeedback && (
        <GlassCard style={{ 
          padding: '40px', 
          marginTop: 10,
          position: 'relative', 
          overflow: 'hidden',
          background: `linear-gradient(to right, ${C.bgCard}, transparent)`,
          border: `1px solid ${C.borderMid}`
        }}>
          <div style={{ 
            position: 'absolute', 
            top: -100, right: -50, 
            width: 400, height: 400, 
            opacity: 0.1, 
            pointerEvents: 'none'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '40%', border: `40px solid ${C.primary}`, transform: 'rotate(45deg)' }} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12, color: C.textPrimary }}>Master the Art of Focus</h3>
            <p style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 0 }}>
              Our advanced AI monitors your narrative arc in real-time. <br/>
              Keep practicing to unlock the "Executive Presence" mastery badge.
            </p>
          </div>
        </GlassCard>
      )}

    </div>
  );
}
