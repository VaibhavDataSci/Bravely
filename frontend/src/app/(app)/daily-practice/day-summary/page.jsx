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
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: C.textPrimary }}>
      {value}
    </div>
  </GlassCard>
);

export default function DaySummaryPage() {
  const [isRecording, setIsRecording] = useState(true);
  const [time, setTime] = useState(180); // 03:00

  useEffect(() => {
    let interval;
    if (isRecording && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, time]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: '0', maxWidth: 1100, margin: '0 auto', color: C.textPrimary, display: 'flex', flexDirection: 'column', gap: 30 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: C.textSecondary, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Daily Practice <span style={{ margin: '0 8px', color: C.textMuted }}>/</span> Day Summary
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Day Summary</h1>
          <p style={{ color: C.textSecondary, fontSize: '1.05rem' }}>Reflect on your day and improve natural communication clarity.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
           <div style={{ color: C.textSecondary, fontSize: '1.2rem', cursor: 'pointer', padding: 8, borderRadius: '50%', background: C.glass }}>🔔</div>
           <div style={{ color: C.textSecondary, fontSize: '1.2rem', cursor: 'pointer', padding: 8, borderRadius: '50%', background: C.glass }}>⚙️</div>
        </div>
      </div>

      {/* TOP: 2 COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* LEFT: RECORDING PANEL */}
        <GlassCard style={{ 
          padding: '60px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 500,
          background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.1em', 
            color: C.textSecondary, 
            textTransform: 'uppercase',
            marginBottom: 16 
          }}>
            Voice Recording Active
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: 50, color: C.textPrimary }}>
            {formatTime(time)}
          </div>
          
          <div style={{ 
            width: 140, height: 140, 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isRecording ? `0 0 60px rgba(167, 139, 250, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)` : `0 0 20px rgba(167, 139, 250, 0.2)`,
            animation: isRecording ? 'pulse 2s infinite' : 'none',
            fontSize: '3rem',
            color: '#fff',
            marginBottom: 50,
            transition: 'all 0.3s ease'
          }} onClick={() => setIsRecording(!isRecording)}>
            🎙️
          </div>

          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isRecording && <MicWave active={true} />}
          </div>
        </GlassCard>

        {/* RIGHT: TRANSCRIPTION & INSIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Transcription */}
          <GlassCard style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, color: C.textPrimary }}>
                <span style={{ color: C.textSecondary }}>≡</span> Live Transcription
              </div>
              <div style={{ fontSize: '0.75rem', color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ 
                  width: 6, height: 6, borderRadius: '50%', background: C.primary, 
                  animation: 'pulse 1.5s infinite' 
                }} /> Processing
              </div>
            </div>

            <div style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 20 }}>
              "...the core challenge of the quarterly review is effectively balancing our ambitious growth targets with the operational constraints we encountered in Q2. I believe the team..."
            </div>
            
            <div style={{ 
              padding: '20px', 
              background: 'rgba(167, 139, 250, 0.05)', 
              borderRadius: 12, 
              borderLeft: `3px solid ${C.primary}`,
              color: C.textPrimary,
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}>
              "...needs to prioritize high-leverage activities that align with our long-term strategic vision, <span style={{ color: C.warning }}>specifically</span> focusing on automation and..."
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 30, display: 'flex', gap: 6 }}>
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: C.borderMid, borderRadius: 2 }} />
            </div>
          </GlassCard>

          {/* AI Insight */}
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

        </div>
      </div>

      {/* PERFORMANCE PREVIEW SECTION */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Performance Preview</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <NeonButton variant="outline" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Save Draft</NeonButton>
            <NeonButton variant="primary" style={{ padding: '10px 24px', fontSize: '0.85rem', color: C.bgMain }}>End Session</NeonButton>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>
          <StatCard icon="🚫" label="Filler Words" value="04" />
          <StatCard icon="⭐" label={<span>Clarity<br/>Score</span>} value={<span>92<span style={{ fontSize: '1rem', color: C.textSecondary }}>%</span></span>} />
          <StatCard icon="🧠" label="Tone" value={<span style={{ fontSize: '1.1rem', color: C.textPrimary }}>Confident</span>} />
          <StatCard icon="📖" label="Vocab" value={<span style={{ fontSize: '1.1rem', color: C.textPrimary }}>High</span>} />
          <StatCard icon="⏱️" label={<span>Pace<br/>(WPM)</span>} value="145" />
          <GlassCard style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(167, 139, 250, 0.05)', border: `1px solid rgba(167, 139, 250, 0.2)` }} hoverEffect>
             <div style={{ color: C.primary, fontSize: '1.2rem' }}>💡</div>
             <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.primary, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>
               Next Step
             </div>
             <div style={{ fontSize: '0.95rem', fontWeight: 500, color: C.textPrimary, textAlign: 'center' }}>
               Pause for Impact
             </div>
          </GlassCard>
        </div>
      </div>

      {/* BOTTOM INSIGHT BANNER */}
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

    </div>
  );
}
