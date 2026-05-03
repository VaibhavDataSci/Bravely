import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../constants/theme';
import { GlassCard } from '../components/shared';

export const MockModeSelection = () => {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 600 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Choose Interview Mode</h1>
        <p style={{ fontSize: 16, color: C.textDim, lineHeight: 1.6 }}>
          Would you like to practice your interview skills with our advanced AI avatar, or connect with real peers for a live mock session?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(280px, 340px)', gap: 32, width: '100%', justifyContent: 'center' }}>
        {/* Option 1: AI Interview */}
        <div 
          onClick={() => navigate('/solo-select')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.children[0].style.boxShadow = `0 0 30px ${C.cyanGlow}`;
            e.currentTarget.children[0].style.borderColor = C.cyan;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.children[0].style.boxShadow = 'none';
            e.currentTarget.children[0].style.borderColor = C.borderMid;
          }}
        >
          <GlassCard style={{
            height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 32, textAlign: 'center', border: `1px solid ${C.borderMid}`, borderRadius: 24,
            background: `linear-gradient(180deg, rgba(7,13,26,0.6) 0%, rgba(3,7,18,0.8) 100%)`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, filter: `drop-shadow(0 0 10px ${C.cyanGlow})` }}>🤖</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.cyan, marginBottom: 12 }}>AI Interviewer</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
              Practice anytime with our intelligent 3D avatar. Get instant, personalized feedback on your performance.
            </p>
          </GlassCard>
        </div>

        {/* Option 2: Peer Interview */}
        <div 
          onClick={() => navigate('/lobby')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.children[0].style.boxShadow = `0 0 30px ${C.violetGlow}`;
            e.currentTarget.children[0].style.borderColor = C.violetBright;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.children[0].style.boxShadow = 'none';
            e.currentTarget.children[0].style.borderColor = C.borderMid;
          }}
        >
          <GlassCard style={{
            height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 32, textAlign: 'center', border: `1px solid ${C.borderMid}`, borderRadius: 24,
            background: `linear-gradient(180deg, rgba(7,13,26,0.6) 0%, rgba(3,7,18,0.8) 100%)`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, filter: `drop-shadow(0 0 10px ${C.violetGlow})` }}>👥</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.violetBright, marginBottom: 12 }}>Peer Interview</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
              Connect with real users in real-time. Practice behavioral and technical interviews via live video.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
