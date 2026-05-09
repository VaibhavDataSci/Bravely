"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard } from '@/components/shared';

export default function MockModeSelection() {
  const router = useRouter();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 600 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Choose Interview Mode</h1>
        <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.6 }}>
          Would you like to practice your interview skills with our advanced AI avatar, or connect with real peers for a live mock session?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(280px, 340px)', gap: 32, width: '100%', justifyContent: 'center' }}>
        {/* Option 1: AI Interview */}
        <div 
          onClick={() => router.push('/solo-select')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.children[0].style.boxShadow = `0 0 30px rgba(167, 139, 250, 0.2)`;
            e.currentTarget.children[0].style.borderColor = C.primary;
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
            background: `linear-gradient(180deg, rgba(7, 8, 22, 0.6) 0%, rgba(3, 4, 11, 0.8) 100%)`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, filter: `drop-shadow(0 0 10px rgba(167, 139, 250, 0.2))` }}>🤖</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.primary, marginBottom: 12 }}>AI Interviewer</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
              Practice anytime with our intelligent 3D avatar. Get instant, personalized feedback on your performance.
            </p>
          </GlassCard>
        </div>

        {/* Option 2: Peer Interview */}
        <div 
          onClick={() => router.push('/daily-practice/peer-practice')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.children[0].style.boxShadow = `0 0 30px rgba(139, 92, 246, 0.2)`;
            e.currentTarget.children[0].style.borderColor = C.secondary;
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
            background: `linear-gradient(180deg, rgba(7, 8, 22, 0.6) 0%, rgba(3, 4, 11, 0.8) 100%)`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, filter: `drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))` }}>👥</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.secondary, marginBottom: 12 }}>Peer Interview</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.5 }}>
              Connect with real users in real-time. Practice behavioral and technical interviews via live video.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
