"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { GlassCard, Tag } from '@/components/shared';

// ─── PAGE 7: PROFILE ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const router = useRouter();

  const achievements = [
    { icon: '🔥', label: '7-Day Streak', earned: true },
    { icon: '⚡', label: 'Speed Talker', earned: true },
    { icon: '🏆', label: 'Top 10%', earned: true },
    { icon: '🎯', label: '50 Interviews', earned: false },
    { icon: '💎', label: 'Perfect Score', earned: false },
    { icon: '🌟', label: 'All Roles', earned: false },
  ];
  return (
    <div style={{ flex: 1, height: '100vh', overflow: 'auto', padding: '32px 36px' }}>
      {/* Profile header */}
      <GlassCard style={{ marginBottom: 24, padding: '32px', background: `linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.06))` }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: `0 0 30px rgba(167, 139, 250, 0.2)`,
            animation: 'glow-pulse 3s ease infinite',
          }}>👤</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Alex Martinez</h2>
            <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 12 }}>alex@email.com · Pro Plan · Member since Jan 2026</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag>Software Engineer</Tag>
              <Tag color={C.secondary}>Frontend Focus</Tag>
              <Tag color={C.success}>Active</Tag>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { n: '32', l: 'Interviews' },
              { n: '84', l: 'Avg Score' },
              { n: '7', l: 'Day Streak' },
              { n: '#47', l: 'Global Rank' },
            ].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Achievements */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Achievements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {achievements.map(({ icon, label, earned }) => (
              <div key={label} style={{
                borderRadius: 10, padding: '16px 10px', textAlign: 'center',
                background: earned ? `rgba(167, 139, 250, 0.2)` : C.bgCard,
                border: `1px solid ${earned ? C.borderMid : C.borderMid}`,
                opacity: earned ? 1 : 0.4,
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 10, color: earned ? C.textPrimary : C.textMuted, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Interview history */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Interview History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { role: 'Senior SWE · Google', score: 88, date: 'Apr 30', type: 'Technical' },
              { role: 'Two Sum + System Design', score: 91, date: 'Apr 28', type: 'Coding' },
              { role: 'PM · Stripe', score: 74, date: 'Apr 27', type: 'Behavioral' },
              { role: 'Staff Eng · Meta', score: 91, date: 'Apr 23', type: 'System Design' },
              { role: 'Frontend Eng · Figma', score: 79, date: 'Apr 20', type: 'Technical' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: C.bgCard, borderRadius: 8, border: `1px solid ${C.borderMid}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }} onClick={() => router.push('/report')}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.role}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.date} · {s.type}</div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono',
                  color: s.score >= 85 ? C.success : s.score >= 75 ? C.primary : C.warning,
                }}>{s.score}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Progress over time */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Trend</div>
          <Tag color={C.success}>+12 pts this month</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {[55, 60, 58, 65, 72, 68, 74, 78, 79, 82, 84, 88, 91, 82, 88].map((v, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 4,
              height: `${(v / 100) * 80}px`,
              background: i === 14
                ? `linear-gradient(to top, ${C.primary}, ${C.secondary})`
                : `${C.primary}${Math.round((i / 14) * 60 + 20).toString(16).padStart(2, '0')}`,
              transition: 'height 1s ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>Jan 2026</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>Apr 2026</span>
        </div>
      </GlassCard>
    </div>
  );
};

// ─── NOTIFICATION SYSTEM ─────────────────────────────────────────────────────

export default ProfilePage;
