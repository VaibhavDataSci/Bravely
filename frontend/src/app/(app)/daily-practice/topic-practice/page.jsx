"use client";
import React, { useState, useEffect } from 'react';
import { GlassCard, NeonButton, MicWave, Tag } from '@/components/shared';
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

const StarPill = ({ label, status }) => {
  // status: 'pending', 'analyzing', 'detected', 'missing', 'partial'
  let color = C.textMuted;
  let bg = 'transparent';
  let border = C.borderMid;
  let icon = '○';

  if (status === 'analyzing') {
    color = C.primary;
    border = C.primary;
    icon = '⚡';
  } else if (status === 'detected') {
    color = C.success || '#10B981';
    border = C.success || '#10B981';
    bg = 'rgba(16, 185, 129, 0.1)';
    icon = '✓';
  } else if (status === 'partial') {
    color = C.warning || '#F59E0B';
    border = C.warning || '#F59E0B';
    bg = 'rgba(245, 158, 11, 0.1)';
    icon = '◐';
  } else if (status === 'missing') {
    color = C.error || '#EF4444';
    border = C.error || '#EF4444';
    bg = 'rgba(239, 68, 68, 0.1)';
    icon = '✕';
  }

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderRadius: '8px',
      border: `1px solid ${border}`,
      background: bg,
      transition: 'all 0.5s ease',
      marginBottom: 10
    }}>
      <span style={{ color: C.textPrimary, fontWeight: 500 }}>{label}</span>
      <span style={{ 
        color, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        {icon} {status === 'analyzing' ? 'Listening...' : status}
      </span>
    </div>
  );
};

export default function TopicPracticePage() {
  const [topicState, setTopicState] = useState('initial'); // 'initial', 'generating', 'ready'
  const [recState, setRecState] = useState('idle'); // 'idle', 'recording', 'processing', 'done'
  const [showFeedback, setShowFeedback] = useState(false);

  // STAR tracking mock states
  const [starS, setStarS] = useState('pending');
  const [starT, setStarT] = useState('pending');
  const [starA, setStarA] = useState('pending');
  const [starR, setStarR] = useState('pending');

  useEffect(() => {
    if (recState === 'recording') {
      setStarS('analyzing');
      setStarT('pending');
      const timings = [
        setTimeout(() => setStarS('detected'), 2000),
        setTimeout(() => setStarT('analyzing'), 2500),
        setTimeout(() => setStarT('partial'), 4000),
        setTimeout(() => setStarA('analyzing'), 4500),
        setTimeout(() => setStarA('detected'), 6500),
        setTimeout(() => setStarR('analyzing'), 7000),
      ];
      return () => timings.forEach(clearTimeout);
    } else if (recState === 'processing' || recState === 'done') {
      if (starR === 'analyzing' || starR === 'pending') setStarR('missing');
    } else if (recState === 'idle') {
      setStarS('pending'); setStarT('pending'); setStarA('pending'); setStarR('pending');
    }
  }, [recState]);

  const handleGenerateTopic = () => {
    setTopicState('generating');
    setTimeout(() => {
      setTopicState('ready');
      setRecState('idle');
    }, 1500);
  };

  const handleMicClick = () => {
    if (recState === 'idle') {
      setRecState('recording');
    } else if (recState === 'recording') {
      setRecState('processing');
      setTimeout(() => {
        setRecState('done');
      }, 2000);
    }
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
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .mic-idle { animation: breathe 4s ease-in-out infinite; }
        .mic-recording { animation: recording-pulse 1.8s ease-in-out infinite; }
        .mic-processing { opacity: 0.7; filter: grayscale(50%); transition: all 0.5s; }
        .fade-in { animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: C.textSecondary, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Daily Practice <span style={{ margin: '0 8px', color: C.textMuted }}>/</span> Topic of the Day
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Topic of the Day</h1>
          <p style={{ color: C.textSecondary, fontSize: '1.05rem' }}>An AI-guided communication challenge to sharpen your everyday speaking.</p>
        </div>
      </div>

      {topicState === 'initial' || topicState === 'generating' ? (
        <GlassCard style={{ 
          padding: '80px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 400,
          background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
        }}>
          <div style={{ 
             width: 100, height: 100, borderRadius: '50%', background: 'rgba(167, 139, 250, 0.1)', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: 24,
             animation: topicState === 'generating' ? 'shimmer 1.5s infinite' : 'none'
          }}>
            🎯
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>Ready for your daily challenge?</h2>
          <p style={{ color: C.textSecondary, fontSize: '1.1rem', marginBottom: 40, textAlign: 'center', maxWidth: 400 }}>
            Receive a surprise communication challenge powered by AI. No timers, just natural speaking.
          </p>
          <NeonButton 
            variant="primary" 
            onClick={handleGenerateTopic} 
            disabled={topicState === 'generating'}
            style={{ padding: '16px 40px', fontSize: '1.1rem' }}
          >
            {topicState === 'generating' ? 'Generating Topic...' : "Get Today's Topic"}
          </NeonButton>
        </GlassCard>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          
          {/* TOPIC CARD */}
          <GlassCard style={{ 
            padding: '40px', 
            position: 'relative', 
            overflow: 'hidden',
            background: `linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(17, 24, 39, 0.8))`,
            border: `1px solid ${C.primary}40`,
            boxShadow: `0 10px 40px ${C.primary}20`
          }}>
            <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: C.primary, opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: '4px 12px', background: 'rgba(167, 139, 250, 0.2)', borderRadius: 20, color: C.primary, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Leadership & Strategy
              </div>
              <div style={{ fontSize: '0.85rem', color: C.textSecondary }}>⭐ Daily Challenge</div>
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.3, color: '#fff', maxWidth: '90%' }}>
              "Describe a time you had to pivot your strategy quickly."
            </h2>
          </GlassCard>

          {/* MAIN TWO COLUMNS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* LEFT: MIC & LIVE TRANSCRIPTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <GlassCard style={{ 
                padding: '40px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
              }}>
                <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {isIdle && (
                    <>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Tap to Start Speaking</h3>
                      <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>Your AI coach is analyzing your structure.</p>
                    </>
                  )}
                  {isRecording && (
                    <div style={{ 
                      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: C.error || '#EF4444', 
                      textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, animation: 'shimmer 1.5s infinite'
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.error || '#EF4444' }} /> Live Recording
                    </div>
                  )}
                  {(isProcessing || isDone) && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: C.primary, animation: isProcessing ? 'shimmer 1.5s infinite' : 'none' }}>
                      {isProcessing ? 'Analyzing Structure...' : 'Analysis Complete'}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(isIdle || isRecording) && (
                    <>
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid rgba(167, 139, 250, 0.3)`,
                        animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite', pointerEvents: 'none'
                      }} />
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid rgba(167, 139, 250, 0.15)`,
                        animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s', pointerEvents: 'none'
                      }} />
                    </>
                  )}

                  <div 
                    className={isRecording ? 'mic-recording' : isIdle ? 'mic-idle' : 'mic-processing'}
                    style={{ 
                      width: 130, height: 130, borderRadius: '50%', 
                      background: isIdle ? `linear-gradient(135deg, rgba(167, 139, 250, 0.7), rgba(139, 92, 246, 0.5))` : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isIdle || isRecording) ? 'pointer' : 'default',
                      fontSize: '3rem', color: '#fff', transition: 'all 0.4s ease', zIndex: 10
                    }} onClick={(isIdle || isRecording) ? handleMicClick : undefined}>
                    🎙️
                  </div>
                </div>

                <div style={{ height: 40, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isRecording ? 1 : 0, transition: 'opacity 0.4s ease', marginTop: 20 }}>
                  <MicWave active={isRecording} />
                </div>
              </GlassCard>

              {/* LIVE TRANSCRIPTION */}
              <GlassCard style={{ padding: '24px', flex: 1, opacity: (isIdle && !showFeedback) ? 0.3 : 1, transition: 'all 0.5s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: C.textSecondary, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Transcript</div>
                  <div style={{ fontSize: '0.75rem', color: C.primary, opacity: (isRecording || isProcessing) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, animation: (isRecording || isProcessing) ? 'pulse 1.5s infinite' : 'none' }} /> 
                    {(isRecording || isProcessing) ? 'Listening' : 'Ready'}
                  </div>
                </div>
                
                <div style={{ color: C.textPrimary, fontSize: '1.05rem', lineHeight: 1.6, minHeight: 120 }}>
                  {!isIdle && "Last quarter, we were planning to launch a major feature... "}
                  {starA === 'detected' && <span style={{ color: C.primary }}>I realized we needed to shift focus, so I gathered the team and...</span>}
                  {isIdle && <span style={{ color: C.textMuted }}>Your spoken response will appear here...</span>}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT: STAR TRACKING & GET FEEDBACK */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <GlassCard style={{ padding: '30px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: '1.4rem' }}>⭐</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: C.textPrimary }}>Real-Time STAR Tracking</h3>
                </div>
                
                <StarPill label="Situation (Context)" status={starS} />
                <StarPill label="Task (Challenge)" status={starT} />
                <StarPill label="Action (What you did)" status={starA} />
                <StarPill label="Result (Outcome/Impact)" status={starR} />

                {(!showFeedback && (isDone || isProcessing)) && (
                  <NeonButton 
                    variant="primary" 
                    onClick={() => setShowFeedback(true)}
                    style={{ width: '100%', marginTop: 24, opacity: isDone ? 1 : 0.5, pointerEvents: isDone ? 'auto' : 'none' }}
                  >
                    Get AI Feedback
                  </NeonButton>
                )}
              </GlassCard>

              {/* IN-FLOW AI COACH MENTOR */}
              {showFeedback && (
                <GlassCard style={{ padding: '24px 30px', display: 'flex', gap: 20, alignItems: 'flex-start', border: `1px solid ${C.primary}`, background: 'rgba(167, 139, 250, 0.05)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(167, 139, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>⚡</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.primary, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>AI Coach Insight</div>
                    <div style={{ color: C.textPrimary, fontSize: '0.95rem', lineHeight: 1.6 }}>
                      You explain your <strong style={{ color: C.primary }}>Action</strong> clearly, but entirely skip the measurable <strong style={{ color: C.error || '#EF4444' }}>Result</strong>. Interviewers need to hear the business impact of your pivot.
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>

          {/* PERFORMANCE METRICS AND COMMUNICATION INSIGHTS (VISIBLE ON FEEDBACK) */}
          {showFeedback && (
            <div className="fade-in" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 30 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 20 }}>Performance Metrics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                  <StatCard icon="⭐" label={<span>STAR<br/>Score</span>} value={<span>45<span style={{ fontSize: '1rem', color: C.textSecondary }}>/100</span></span>} />
                  <StatCard icon="🧠" label="Tone" value={<span style={{ fontSize: '1.1rem', color: C.textPrimary }}>Analytical</span>} />
                  <StatCard icon="🚫" label={<span>Filler<br/>Words</span>} value={<span style={{ color: C.success || '#10b981' }}>0</span>} />
                  <StatCard icon="⏱️" label={<span>Pace<br/>(WPM)</span>} value="130" />
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 20 }}>Speaking Pattern Insights</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <GlassCard style={{ padding: '24px', borderLeft: `4px solid ${C.success || '#10B981'}` }}>
                     <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Strongest Trait</div>
                     <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, color: C.textPrimary }}>Action Bias</h4>
                     <p style={{ color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.6 }}>You strongly highlighted your personal action and decision-making logic, showing ownership of the pivot.</p>
                  </GlassCard>
                  
                  <GlassCard style={{ padding: '24px', borderLeft: `4px solid ${C.error || '#EF4444'}` }}>
                     <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Area for Growth</div>
                     <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, color: C.textPrimary }}>Missing Outcomes</h4>
                     <p style={{ color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.6 }}>Your story ended abruptly. Always conclude with data-driven impact. Try: "As a result, we hit deadline and saved 20% budget."</p>
                  </GlassCard>
                </div>
              </div>
              
              <GlassCard style={{ padding: '40px', position: 'relative', overflow: 'hidden', background: `linear-gradient(to right, ${C.bgCard}, transparent)`, border: `1px solid ${C.borderMid}`, marginTop: 10 }}>
                <div style={{ position: 'absolute', top: -100, right: -50, width: 400, height: 400, opacity: 0.1, pointerEvents: 'none' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '40%', border: `40px solid ${C.primary}`, transform: 'rotate(45deg)' }} />
                </div>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '70%' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12, color: C.textPrimary }}>Level Up Your Framework</h3>
                  <p style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 0 }}>
                    Mastering the STAR method is key for leadership roles. Would you like to retry this prompt with an AI guide mapping your results?
                  </p>
                  <NeonButton variant="primary" style={{ marginTop: 24, padding: '12px 24px' }} onClick={() => { setRecState('idle'); setShowFeedback(false); setTopicState('initial'); }}>
                    Try Another Topic
                  </NeonButton>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
