"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, ScoreRing, MiniBar, NeonButton, Tag } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';

// ─── DASHBOARD PAGE ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('1W');

  // Determine dynamic display name
  const displayName = user?.profileResume?.personalInfo?.name || user?.name || user?.email?.split('@')[0] || 'User';

  const overallScore = 84;
  const scores = [
    { label: 'Confidence', value: 82, color: C.primary, trend: '+4' },
    { label: 'Clarity', value: 74, color: C.secondary, trend: '+2' },
    { label: 'Tone', value: 89, color: C.success, trend: '+6' },
    { label: 'Coding', value: 91, color: C.warning, trend: '+8' },
  ];
  const weekData = [55, 62, 58, 70, 74, 80, 85];
  
  // Try to use user's preferred role if available, otherwise fallback to static data
  const userRole = user?.profileResume?.role || 'Software Engineer';
  const isCodingHeavy = userRole.toLowerCase().includes('engineer') || userRole.toLowerCase().includes('developer');
  const isCloudDevOps = userRole.toLowerCase().includes('cloud') || userRole.toLowerCase().includes('devops');
  const isHR = userRole.toLowerCase().includes('hr') || userRole.toLowerCase().includes('product') || userRole.toLowerCase().includes('manager');

  const recentSessions = [
    { role: `Senior ${userRole} — Google`, date: 'Yesterday', score: 88, type: isCodingHeavy ? 'Technical' : 'Behavioral', icon: isCodingHeavy ? '💻' : '🎯' },
    { role: isCloudDevOps ? 'System Design — AWS' : isHR ? 'PM — Stripe' : 'Two Sum + System Design', date: '2 days ago', score: 91, type: isCloudDevOps || isCodingHeavy ? 'Coding' : 'Behavioral', icon: isCloudDevOps ? '☁️' : isHR ? '🎯' : '🧩' },
    { role: 'Peer Mock w/ Jordan K.', date: '3 days ago', score: 79, type: 'Peer P2P', icon: '👥' },
  ];

  const typeColors = { Technical: C.primary, Coding: C.warning, 'Peer P2P': C.secondary, Behavioral: C.success, HR: C.info };

  // Generate dynamic subtext based on profile
  let dynamicSubtext = "Your interview skills are improving steadily. Focus on reducing filler words and pacing for your next session.";
  if (isCodingHeavy) {
    dynamicSubtext = "Your coding consistency improved this week. AI recommends focusing on pacing during algorithm explanations.";
  } else if (isHR) {
    dynamicSubtext = "Your communication scores are improving steadily. Try focusing on STAR method structure for behavioral questions.";
  } else if (isCloudDevOps) {
    dynamicSubtext = "Great progress on architectural concepts. AI recommends a System Design round next to test load balancing knowledge.";
  }

  // Shared styles
  const sectionLabel = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 };
  const thinBar = (pct, color) => (
    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', marginTop: 6 }}>
      <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, transition: 'width 1.2s ease' }} />
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>

      {/* ═══ HERO SECTION ═══ */}
      <div style={{
        padding: '28px 32px', borderRadius: 16, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.04) 50%, rgba(139,92,246,0.03) 100%)',
        border: '1px solid rgba(139,92,246,0.1)',
        animation: 'fade-in-up 0.6s ease-out forwards'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Dashboard Overview</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 6px 0' }}>Welcome back, {displayName} 👋</h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
              {dynamicSubtext}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* Overall Score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 56, fontWeight: 900, lineHeight: 1,
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{overallScore}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>AI Score</div>
            </div>
            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Streak', val: '7 days', icon: '🔥', color: C.warning },
                { label: 'This Week', val: '+12%', icon: '📈', color: C.success },
                { label: 'Sessions', val: '24', icon: '🎤', color: C.primary },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center', minWidth: 80,
                }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SKILL SCORE CARDS ═══ */}
      <div style={sectionLabel}>Performance Metrics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {scores.map(sc => (
          <div key={sc.label} style={{
            padding: '20px', borderRadius: 12,
            background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 16,
            transition: 'all 0.2s', cursor: 'default',
          }}>
            <ScoreRing value={sc.value} label="" color={sc.color} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>{sc.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: 'JetBrains Mono' }}>{sc.value}</span>
                <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>{sc.trend}%</span>
              </div>
              <MiniBar data={[...weekData.slice(0, 5), sc.value - 5, sc.value]} color={sc.color} height={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ═══ STREAK + PROGRESS ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14, marginBottom: 28 }}>
        {/* Streak Card */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={sectionLabel}>Current Streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: C.warning, lineHeight: 1 }}>7</span>
            <span style={{ fontSize: 14, color: C.textMuted }}>days</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 26, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${C.warning}15`, border: `1px solid ${C.warning}30`,
                fontSize: 9, color: C.warning, fontWeight: 700,
              }}>{d}</div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
            🏆 Best: <span style={{ color: C.warning, fontWeight: 600 }}>14 days</span> · Keep going!
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={sectionLabel}>Weekly Progress</div>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: 2 }}>
              {['1W', '1M', '3M'].map(t => (
                <button key={t} onClick={() => setTimeRange(t)} style={{
                  padding: '4px 12px', borderRadius: 5, fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: timeRange === t ? `${C.primary}18` : 'transparent',
                  color: timeRange === t ? C.primary : C.textMuted,
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 70 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'JetBrains Mono' }}>{v}</div>
                <div style={{
                  width: '100%', borderRadius: 4,
                  height: `${(v / 100) * 55}px`,
                  background: i === weekData.length - 1
                    ? `linear-gradient(to top, ${C.primary}, ${C.secondary})`
                    : `linear-gradient(to top, ${C.primary}30, ${C.primary}50)`,
                  transition: 'height 1s ease',
                }} />
                <span style={{ fontSize: 9, color: C.textMuted }}>{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ STRENGTHS + RECENT SESSIONS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Strengths & Focus */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={sectionLabel}>Strengths & Focus Areas</div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.success, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>✓ Strengths</div>
            {[
              { label: 'Technical articulation', pct: 89 },
              { label: 'Story structure (STAR)', pct: 82 },
              { label: 'Coding accuracy', pct: 91 },
            ].map(({ label, pct }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: C.textPrimary }}>{label}</span>
                  <span style={{ fontSize: 11, color: C.success, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{pct}%</span>
                </div>
                {thinBar(pct, C.success)}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.warning, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>→ Needs Improvement</div>
            {[
              { label: 'Filler words (um/uh)', pct: 38 },
              { label: 'Pacing & pauses', pct: 52 },
              { label: 'Eye contact', pct: 64 },
            ].map(({ label, pct }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: C.textPrimary }}>{label}</span>
                  <span style={{ fontSize: 11, color: C.warning, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{pct}%</span>
                </div>
                {thinBar(pct, C.warning)}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...sectionLabel }}>
            <span>Recent Sessions</span>
            <button onClick={() => router.push('/report')} style={{
              fontSize: 10, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map((sess, i) => (
              <div key={i} onClick={() => router.push('/report')} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.04)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                <div style={{ fontSize: 20, width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  {sess.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{sess.role}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: C.textMuted }}>{sess.date}</span>
                    <span style={{
                      fontSize: 9, padding: '1px 6px', borderRadius: 3, fontWeight: 600,
                      background: `${typeColors[sess.type] || C.primary}12`,
                      color: typeColors[sess.type] || C.primary,
                    }}>{sess.type}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono',
                  color: sess.score >= 85 ? C.success : sess.score >= 70 ? C.primary : C.warning,
                }}>{sess.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
