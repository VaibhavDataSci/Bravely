import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/theme';
import { NeonButton, GlassCard, ScoreRing, MiniBar } from '../components/shared';

// ─── PAGE 2: DASHBOARD ───────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();

  const scores = [
    { label: 'Confidence', value: 82, color: C.cyan },
    { label: 'Clarity', value: 74, color: C.violetBright },
    { label: 'Tone', value: 89, color: C.green },
    { label: 'Coding', value: 91, color: C.amber },
  ];
  const weekData = [62, 70, 68, 75, 80, 82, 85];
  const recentSessions = [
    { role: 'Senior SWE — Google', date: 'Yesterday', score: 88, type: 'Technical' },
    { role: 'Two Sum + System Design', date: '2 days ago', score: 91, type: 'Coding' },
    { role: 'Peer Mock w/ Jordan K.', date: '3 days ago', score: 79, type: 'Peer P2P' },
    { role: 'PM — Stripe', date: '4 days ago', score: 74, type: 'Behavioral' },
  ];
  return (
    <div style={{ flex: 1, padding: '32px 36px' }}>
      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {scores.map(s => (
          <GlassCard key={s.label} style={{ textAlign: 'center', padding: '28px 16px' }}>
            <ScoreRing value={s.value} label={s.label} color={s.color} />
            <div style={{ marginTop: 12 }}>
              <MiniBar data={[...weekData.slice(0, 5), s.value - 5, s.value]} color={s.color} height={36} />
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Last 7 sessions</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Row: streak + progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Streak */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Current Streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: C.amber, lineHeight: 1 }}>7</span>
            <span style={{ fontSize: 16, color: C.textDim }}>days</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < 7 ? `${C.amber}25` : C.glass,
                border: `1px solid ${i < 7 ? C.amber + '40' : 'transparent'}`,
                fontSize: 10, color: i < 7 ? C.amber : C.textMuted, fontWeight: 600,
              }}>{d}</div>
            ))}
          </div>
        </GlassCard>

        {/* Progress chart */}
        <GlassCard style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Progress</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1W', '1M', '3M'].map((t, i) => (
                <button key={t} style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: i === 0 ? `${C.cyan}20` : 'transparent',
                  color: i === 0 ? C.cyan : C.textMuted, fontFamily: 'Space Grotesk',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {[55, 62, 58, 70, 74, 80, 85].map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', borderRadius: 4,
                  height: `${(v / 100) * 80}px`,
                  background: i === 6
                    ? `linear-gradient(to top, ${C.cyan}, ${C.violetBright})`
                    : `linear-gradient(to top, ${C.cyan}40, ${C.cyan}60)`,
                  transition: 'height 1s ease',
                }} />
                <span style={{ fontSize: 9, color: C.textMuted }}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Strengths/weaknesses + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Strengths & Focus Areas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Technical articulation', pct: 89, good: true },
              { label: 'Story structure (STAR)', pct: 82, good: true },
              { label: 'Eye contact', pct: 74, good: true },
              { label: 'Filler words (um/uh)', pct: 38, good: false },
              { label: 'Pacing & pauses', pct: 52, good: false },
            ].map(({ label, pct, good }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.text }}>{label}</span>
                  <span style={{ fontSize: 12, color: good ? C.green : C.amber, fontFamily: 'JetBrains Mono' }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, width: `${pct}%`,
                    background: good ? `linear-gradient(90deg, ${C.green}80, ${C.green})` : `linear-gradient(90deg, ${C.amber}80, ${C.amber})`,
                    transition: 'width 1.2s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Recent Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSessions.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                background: C.glass, borderRadius: 10, border: `1px solid ${C.border}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }} onClick={() => navigate('/report')}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.cyanGlow}, ${C.violetGlow})`,
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>◈</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.role}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.date} · {s.type}</div>
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700,
                  color: s.score >= 85 ? C.green : s.score >= 70 ? C.cyan : C.amber,
                }}>{s.score}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ─── PAGE 3: SOLO INTERVIEW ───────────────────────────────────────────────────

export { DashboardPage };
