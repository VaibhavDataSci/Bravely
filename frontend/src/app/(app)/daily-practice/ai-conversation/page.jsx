"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    cursor: 'default',
    background: `linear-gradient(to bottom, rgba(167, 139, 250, 0.05), transparent)`
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

const ProgressBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: '0.85rem', color: C.textSecondary, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: C.textPrimary, fontWeight: 600 }}>{value}%</span>
    </div>
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ 
        height: '100%', 
        width: `${value}%`, 
        background: color,
        borderRadius: 4,
        boxShadow: `0 0 10px ${color}`,
        transition: 'width 1s ease-in-out'
      }} />
    </div>
  </div>
);

export default function AIConversationPage() {
  const router = useRouter();
  const [convState, setConvState] = useState('live'); // 'live', 'ended', 'feedback'
  const [micMode, setMicMode] = useState('listening'); // 'listening', 'aiSpeaking'
  
  // Real-time conversation mock logic
  useEffect(() => {
    let timeout1, timeout2;
    if (convState === 'live') {
      // Simulate taking turns
      const loop = () => {
        timeout1 = setTimeout(() => {
          setMicMode('aiSpeaking');
          timeout2 = setTimeout(() => {
            setMicMode('listening');
            loop();
          }, 4000); // AI speaks for 4s
        }, 8000); // User speaks for 8s
      };
      loop();
    }
    return () => { clearTimeout(timeout1); clearTimeout(timeout2); };
  }, [convState]);

  const handleStart = () => {
    setConvState('live');
    setMicMode('listening');
  };

  const handleEnd = () => {
    setConvState('ended');
  };

  const handleGetFeedback = () => {
    setConvState('feedback');
  };

  const isUserSpeaking = micMode === 'listening';
  const isAiSpeaking = micMode === 'aiSpeaking';

  return (
    <div style={{ padding: '32px 32px 60px', maxWidth: 1100, margin: '0 auto', color: C.textPrimary, display: 'flex', flexDirection: 'column', gap: 30 }}>
      
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
        @keyframes mic-recording {
          0% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
          20% { box-shadow: 0 0 80px rgba(167, 139, 250, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.4); transform: scale(1.08); }
          100% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
        }
        @keyframes ai-speaking {
          0% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
          50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.4); transform: scale(1.05); }
          100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2); transform: scale(1); }
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
        .mic-user { animation: mic-recording 2s ease-in-out infinite; }
        .mic-ai { animation: ai-speaking 3s ease-in-out infinite; background: linear-gradient(135deg, #10B981, #059669) !important; }
        .fade-in { animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>


      {convState === 'live' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, marginTop: 20 }}>
          
          <div style={{ width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>On a Call</h2>
              <p style={{ color: C.textSecondary, margin: '8px 0 0 0' }}>Speak naturally. Your AI companion is listening.</p>
            </div>
            <NeonButton variant="outline" onClick={handleEnd} style={{ borderColor: C.error || '#EF4444', color: C.error || '#EF4444' }}>
              End Call
            </NeonButton>
          </div>

          <GlassCard style={{ 
            width: '100%',
            maxWidth: 700,
            padding: '60px 40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 500,
            background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
          }}>
            <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
              {isUserSpeaking ? (
                <>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: C.textPrimary, marginBottom: 8, animation: 'shimmer 2s infinite' }}>The AI is listening...</h3>
                  <p style={{ color: C.textSecondary, fontSize: '0.95rem' }}>Speak without any pressure.</p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.success || '#10B981', fontWeight: 600, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success || '#10B981', animation: 'pulse 1s infinite' }} />
                    AI Responding
                  </div>
                </>
              )}
            </div>

            <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
                animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite', pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(167, 139, 250, 0.15)'}`,
                animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s', pointerEvents: 'none'
              }} />

              <div 
                className={isAiSpeaking ? 'mic-ai' : 'mic-user'}
                style={{ 
                  width: 150, height: 150, borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', color: '#fff', transition: 'all 0.4s ease', zIndex: 10,
                  boxShadow: `0 0 40px ${isAiSpeaking ? 'rgba(16, 185, 129, 0.5)' : 'rgba(167, 139, 250, 0.5)'}`
                }}>
                {isAiSpeaking ? '📞' : '🎙️'}
              </div>
            </div>

            <div style={{ height: 60, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 40, opacity: 1, transition: 'opacity 0.4s ease' }}>
              <MicWave active={true} color={isAiSpeaking ? '#10B981' : undefined} />
            </div>
          </GlassCard>
        </div>
      )}

      {convState === 'ended' && (
         <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
          <GlassCard style={{ 
            padding: '80px 40px', 
            position: 'relative', 
            overflow: 'hidden',
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: `linear-gradient(135deg, rgba(30, 27, 75, 0.2), rgba(17, 24, 39, 0.4))`
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 20, color: C.error || '#EF4444' }}>
              📞
            </div>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>Call Ended</h2>
            <p style={{ color: C.textSecondary, fontSize: '1.1rem', marginBottom: 40 }}>
              Duration: 04:12 • Great conversation!
            </p>
            
            <NeonButton variant="primary" onClick={handleGetFeedback} style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: 40 }}>
              Get AI Feedback
            </NeonButton>
          </GlassCard>
         </div>
      )}

      {convState === 'feedback' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>Call Feedback</h2>
            <p style={{ color: C.textSecondary, fontSize: '1.1rem' }}>Detailed insights from your phone call practice.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {/* COMMUNICATION SUMMARY - 5 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              <StatCard icon="⚡" label="Confidence" value={<span>88<span style={{ fontSize: '1rem', color: C.textSecondary }}>/100</span></span>} />
              <StatCard icon="🌊" label="Fluency" value={<span>92<span style={{ fontSize: '1rem', color: C.textSecondary }}>/100</span></span>} />
              <StatCard icon="🎙️" label="Pace (WPM)" value="142" />
              <StatCard icon="🧠" label="Clarity Score" value={<span>85<span style={{ fontSize: '1rem', color: C.textSecondary }}>/100</span></span>} />
              <StatCard icon="🚫" label="Filler Words" value={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center' }}>
                  <span style={{ color: C.error || '#EF4444', fontSize: '1.1rem', fontWeight: 600 }}>uh - 3</span>
                  <span style={{ color: C.warning || '#F59E0B', fontSize: '1.1rem', fontWeight: 600 }}>like - 2</span>
                </div>
              } />
            </div>

            {/* ADDITIONAL METRICS - Progress bars mapped horizontally */}
            <GlassCard style={{ padding: '30px', display: 'flex', gap: 40, alignItems: 'center' }}>
               <div style={{ flex: 1 }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: C.textPrimary, marginBottom: 20 }}>Detailed Analysis</h3>
                 <ProgressBar label="Vocabulary Richness" value={78} color={C.primary} />
                 <ProgressBar label="Tone Consistency" value={90} color={C.secondary} />
                 <ProgressBar label="Listening Ratio" value={65} color="#3B82F6" />
               </div>
               <div style={{ flex: 1, paddingLeft: 40, borderLeft: `1px solid ${C.borderMid}` }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: C.primary }}>
                     💡
                   </div>
                   <div>
                     <div style={{ fontSize: '0.85rem', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Key Takeaway</div>
                     <div style={{ fontSize: '1.1rem', color: C.textPrimary, fontWeight: 500 }}>Expand your vocabulary.</div>
                   </div>
                 </div>
                 <p style={{ color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>
                   You rely heavily on safe, common words. Try to replace words like &quot;good&quot; or &quot;fine&quot; with more descriptive adjectives like &quot;effective&quot; or &quot;optimal&quot;.
                 </p>
               </div>
            </GlassCard>

            {/* CONVERSATIONAL INSIGHTS & IMPROVEMENT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <GlassCard style={{ padding: '30px', borderTop: `4px solid ${C.success || '#10B981'}`, background: `linear-gradient(to bottom, rgba(16, 185, 129, 0.05), transparent)` }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Areas of Strength</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: C.textPrimary, fontSize: '1.05rem', lineHeight: 1.7 }}>
                  <li style={{ marginBottom: 12 }}>You maintained strong conversational energy.</li>
                  <li style={{ marginBottom: 12 }}>Your confidence improved throughout the session.</li>
                  <li>You naturally explained ideas clearly without rushing.</li>
                </ul>
              </GlassCard>

              <GlassCard style={{ padding: '30px', borderTop: `4px solid ${C.warning || '#F59E0B'}`, background: `linear-gradient(to bottom, rgba(245, 158, 11, 0.05), transparent)` }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Opportunities for Growth</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: C.textPrimary, fontSize: '1.05rem', lineHeight: 1.7 }}>
                  <li style={{ marginBottom: 12 }}>Pause slightly before changing topics.</li>
                  <li style={{ marginBottom: 12 }}>Reduce transitional fillers like &quot;uh&quot; when bridging thoughts.</li>
                  <li>Expand on personal experiences with more specific, descriptive details.</li>
                </ul>
              </GlassCard>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            <NeonButton variant="outline" onClick={() => router.push('/daily-practice')} style={{ padding: '12px 30px' }}>
              ← Back to Daily Practice
            </NeonButton>
            <NeonButton variant="primary" onClick={() => { setConvState('live'); setMicMode('listening'); }} style={{ padding: '12px 30px' }}>
              Start Another Call
            </NeonButton>
          </div>

        </div>
      )}

    </div>
  );
}
