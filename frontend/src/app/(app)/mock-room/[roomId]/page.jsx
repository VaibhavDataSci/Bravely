"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, AIAvatar } from '@/components/shared';
import { VideoCall } from '@/components/video/VideoCall';
import { useAuth } from '@/contexts/AuthContext';

// ─── PAGE 4: MOCK INTERVIEW ───────────────────────────────────────────────────
const MockPage = () => {
  const router = useRouter();
  const { roomId } = useParams();
  const { user } = useAuth();
  
  const [liveFeedback, setLiveFeedback] = React.useState([
    { text: 'Strong opening statement', color: C.success, t: '00:12' },
    { text: 'Avoid filler words', color: C.warning, t: '00:38' },
    { text: 'Good technical depth', color: C.success, t: '01:15' },
  ]);

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', height: '100vh', overflow: 'hidden', background: '#030712' }}>
      {/* Main area - Video Call */}
      <VideoCall roomId={roomId || 'mock-default'} userId={user?.email || `user-${Math.floor(Math.random()*1000)}`} mode="mock" onEndCall={() => router.push('/report')} />

      {/* Feedback panel */}
      <div style={{

        borderLeft: `1px solid ${C.borderMid}`,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(7, 8, 22,0.95)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.borderMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Live AI Feedback</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Real-time analysis of your responses</div>
        </div>
        {/* Live scores */}
        <div style={{ padding: 16, borderBottom: `1px solid ${C.borderMid}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { l: 'Confidence', v: 78, c: C.primary },
              { l: 'Relevance', v: 85, c: C.success },
              { l: 'Fluency', v: 62, c: C.warning },
              { l: 'Depth', v: 90, c: C.secondary },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: C.bgCard, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.borderMid}` }}>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono' }}>{v}</div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${v}%`, background: c, borderRadius: 1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Feedback log */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feedback Log</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveFeedback.map((f, i) => (
              <div key={i} style={{
                background: `${f.color}08`, borderRadius: 8, padding: '10px 14px',
                border: `1px solid ${f.color}25`, display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.textPrimary, lineHeight: 1.4 }}>{f.text}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontFamily: 'JetBrains Mono' }}>{f.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Suggested question */}
        <div style={{ padding: 16, borderTop: `1px solid ${C.borderMid}` }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Question Preview</div>
          <div style={{ background: C.bgCard, borderRadius: 8, padding: '12px 14px', fontSize: 12, color: C.textSecondary, lineHeight: 1.5, border: `1px solid ${C.borderMid}` }}>
            "How do you approach technical debt in a fast-moving startup?"
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE 5: GROUP DISCUSSION ─────────────────────────────────────────────────

export default MockPage;
