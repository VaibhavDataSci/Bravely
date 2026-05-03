import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/theme';
import { NeonButton, Tag, MicWave } from '../components/shared';
import { VideoCall } from '../components/video/VideoCall';
import { useAuth } from '../contexts/AuthContext';

// ─── PAGE 5: GROUP DISCUSSION ─────────────────────────────────────────────────
const GroupPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  const [activeSpeak, setActiveSpeak] = React.useState(0);

  const participants = [
    { name: 'Alex M.', role: 'You', avatar: '👤', score: 72, speaking: activeSpeak === 0 },
    { name: 'Jordan K.', role: 'Candidate', avatar: '🧑', score: 65, speaking: activeSpeak === 1 },
    { name: 'Sam L.', role: 'Candidate', avatar: '👩', score: 81, speaking: activeSpeak === 2 },
    { name: 'Riley T.', role: 'Candidate', avatar: '🧔', score: 58, speaking: activeSpeak === 3 },
  ];

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', height: '100vh', overflow: 'hidden', background: '#030712' }}>
      
      {/* Video Call main area */}
      <VideoCall roomId={roomId || 'group-default'} userId={user?.email || `user-${Math.floor(Math.random()*1000)}`} mode="group" onEndCall={() => navigate('/report')} />

      {/* Right panel */}
      <div style={{
        borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
        background: 'rgba(7,13,26,0.95)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Participation Metrics</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>AI observer analysis</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {participants.filter(p => !p.isAI).map((p, i) => (
            <div key={i} style={{ background: C.glass, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                <Tag color={p.speaking ? C.cyan : C.textMuted}>{p.speaking ? 'Speaking' : 'Listening'}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.cyan, fontFamily: 'JetBrains Mono', lineHeight: 1 }}>{p.score}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>contribution<br/>score</div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${p.score}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violetBright})`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
          <NeonButton style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/report')}>
            End & View Report
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE 6: ANALYSIS REPORT ──────────────────────────────────────────────────

export { GroupPage };
