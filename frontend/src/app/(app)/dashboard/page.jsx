"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import styles from './Dashboard.module.css';

// ─── Metric config: maps backend keys → display labels + accent colors ────────
const METRIC_CONFIG = [
  { key: 'confidence', label: 'Confidence', accent: C.primary },
  { key: 'clarity',    label: 'Clarity',    accent: C.secondary },
  { key: 'fluency',    label: 'Fluency',    accent: C.glow },
  { key: 'structure',  label: 'Structure',  accent: C.info },
  { key: 'vocabulary', label: 'Vocabulary', accent: C.accentSettings },
  { key: 'posture',    label: 'Posture',    accent: C.success },
];

const METRIC_INSIGHTS = {
  confidence: 'Confidence level across all sessions.',
  clarity:    'Clarity of communication and delivery.',
  fluency:    'Speech fluency and natural flow.',
  structure:  'Answer structure and narrative organization.',
  vocabulary: 'Vocabulary richness and word variety.',
  posture:    'Posture stability and camera framing.',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [range, setRange] = useState('7');
  const { data, isLoading, isMock, error, refetch } = useDashboard(range);
  const displayName = (
    user?.profileResume?.personalInfo?.name ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'User'
  );

  const userRole = user?.profileResume?.role || 'Software Engineer';
  const isCodingHeavy = /engineer|developer/i.test(userRole);
  const isCloudDevOps = /cloud|devops/i.test(userRole);
  const isHR = /hr|product|manager/i.test(userRole);

  let dynamicSubtext = 'Clarity + confidence: keep the momentum.';
  if (isCodingHeavy) dynamicSubtext = 'Your coding consistency improved this week. AI recommends focusing on pacing.';
  else if (isHR) dynamicSubtext = 'Your communication scores are improving steadily. Focus on STAR method structure.';
  else if (isCloudDevOps) dynamicSubtext = 'Great progress on architectural concepts. Ready for a System Design mock?';

  // ── SVG path helpers ────────────────────────────────────────────────────────
  const perfPoints = data?.perfPoints || [];
  const perfPointsStr = perfPoints.map(p => `${p.x} ${p.y}`).join(' L ');
  const perfStrokePath = perfPointsStr ? `M ${perfPointsStr}` : '';
  const lastPt = perfPoints[perfPoints.length - 1];
  const firstPt = perfPoints[0];
  const perfAreaPath = perfStrokePath
    ? `${perfStrokePath} L ${lastPt.x} 390 L ${firstPt.x} 390 Z`
    : '';

  // ── Radar ───────────────────────────────────────────────────────────────────
  const metrics = data?.metrics || {};
  const radarCenter = { x: 200, y: 160 };
  const radarMax = 100;
  const radarAngles = METRIC_CONFIG.map((_, i) =>
    (-Math.PI / 2) + (2 * Math.PI * i) / METRIC_CONFIG.length
  );
  const radarPoints = METRIC_CONFIG.map((m, i) => {
    const pct = metrics[m.key] ?? 0;
    const r = (pct / 100) * radarMax;
    const x = Math.round(radarCenter.x + r * Math.cos(radarAngles[i]));
    const y = Math.round(radarCenter.y + r * Math.sin(radarAngles[i]));
    return `${x},${y}`;
  }).join(' ');

  const radarLabelPositions = METRIC_CONFIG.map((m, i) => {
    const angle = radarAngles[i];
    const x = Math.round(radarCenter.x + (radarMax + 32) * Math.cos(angle));
    const y = Math.round(radarCenter.y + (radarMax + 32) * Math.sin(angle));
    return { x, y, label: m.label };
  });

  const overallScore = metrics.overall ?? 0;

  // ── Sessions ─────────────────────────────────────────────────────────────────
  const sessions = data?.sessions || [];
  const milestones = data?.milestones || [];
  const fillerWords = data?.fillerWords || [];
  const streak = data?.streak || { current: 0 };
  const strengths = data?.strengths || [];
  const growthAreas = data?.growthAreas || [];

  return (
    <div className={styles.page}>

      {/* ── Offline / Mock Banner ── */}
      {isMock && !isLoading && (
        <div style={{
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: '#FCD34D',
        }}>
          <span>⚠️</span>
          <span>
            {error
              ? 'Backend is currently unreachable — showing demo data.'
              : 'Some data could not be loaded — showing partial demo data.'}
          </span>
          <button
            onClick={refetch}
            style={{
              marginLeft: 'auto',
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 6,
              color: '#FCD34D',
              fontSize: 12,
              padding: '3px 10px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.greeting}>
          <div className={styles.greetTitle} suppressHydrationWarning>
            Welcome back, {displayName}
          </div>
          <div className={styles.greetSub}>{dynamicSubtext}</div>
        </div>

        <div className={styles.streakCard}>
          <div className={styles.streakGlass}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Streak</div>
                <div className={styles.streakValue}>
                  {isLoading ? '…' : `${streak.current} Days`}
                </div>
                <div className={styles.streakLabel}>Daily speaking momentum is building.</div>
              </div>
              <div className={`${styles.streakRing} ${styles.streakPulse}`} aria-hidden>
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="sr" x1="0" x2="1">
                      <stop offset="0%" stopColor="#FFD2A8" />
                      <stop offset="100%" stopColor="#FF8B8B" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="url(#sr)" strokeWidth="6" fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={isLoading ? 251 : Math.max(10, 251 - (streak.current / 30) * 251)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SPLIT */}
      <div className={styles.layoutSplit}>
        <div className={styles.leftColumn}>

          {/* Performance Chart */}
          <div className={`${styles.cardPremium} ${styles.performanceCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Performance Progress</div>
                <div className={styles.cardSub}>Historical growth of your communication confidence.</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => setRange('7')}
                  className={styles.rangeBtn}
                  style={range === '7' ? { background: 'rgba(255,255,255,0.05)' } : {}}
                >7D</button>
                <button
                  onClick={() => setRange('30')}
                  className={styles.rangeBtn}
                  style={range === '30' ? { background: 'rgba(255,255,255,0.05)' } : {}}
                >30D</button>
              </div>
            </div>
            <svg className={styles.performanceSVG} viewBox="0 0 900 440" preserveAspectRatio="xMinYMin meet">
              <defs>
                <linearGradient id="gconf" x1="0" x2="1">
                  <stop offset="0%" stopColor="#B794F4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#B794F4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {isLoading ? (
                <text x="450" y="220" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="16">Loading…</text>
              ) : (
                <>
                  {perfAreaPath && <path d={perfAreaPath} fill="url(#areaGrad)" className={styles.areaFill} />}
                  {perfStrokePath && <path d={perfStrokePath} fill="none" stroke="url(#gconf)" strokeWidth="4.5" className={styles.perfLine} strokeLinecap="round" strokeLinejoin="round" />}
                  {perfPoints.map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r={7} fill="#fff" opacity={0.95} className={styles.perfMarker} />
                  ))}
                  {perfPoints.map((p, idx) => (
                    <text key={`t-${idx}`} x={p.x} y={420} className={styles.xLabel} textAnchor="middle">{p.label}</text>
                  ))}
                </>
              )}
            </svg>
          </div>

          {/* Communication Health */}
          <div className={styles.healthGridInline}>
            {METRIC_CONFIG.map(m => {
              const pct = isLoading ? 0 : (metrics[m.key] ?? 0);
              return (
                <div key={m.key} className={styles.insightWidget}>
                  <div className={styles.widgetTitle}>{m.label}</div>
                  <div className={styles.widgetSmall}>
                    {isLoading ? '...' : METRIC_INSIGHTS[m.key]}
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginTop: 8 }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 6,
                      background: `linear-gradient(90deg, ${m.accent}, ${C.secondary})`,
                      transition: 'width 1s',
                    }} />
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 800, fontSize: 13 }}>
                    {isLoading ? '–' : `${pct}%`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Growth Areas */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Your Strengths &amp; Growth Areas</div>
                <div className={styles.cardSub}>Personalized communication insights based on recent sessions.</div>
              </div>
            </div>
            <div className={styles.sgGrid}>
              <div className={styles.sgCard}>
                <div className={styles.sgLabel}>
                  <span className={styles.sgDot} style={{ background: '#4ADE80' }} />Your Strengths
                </div>
                <div className={styles.sgList}>
                  {isLoading
                    ? [1, 2, 3].map(i => (
                        <div key={i} className={styles.sgItem}>
                          <div style={{ width: '100%', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                        </div>
                      ))
                    : strengths.map((s, i) => (
                        <div key={i} className={styles.sgItem}>
                          <div className={styles.sgCheck}>✓</div>
                          <div style={{ flex: 1 }}>
                            <div className={styles.sgText}>{s.text}</div>
                          </div>
                          <div className={`${styles.sgPill} ${s.status === 'Improving' ? styles.sgPillGreen : styles.sgPillNeutral}`}>
                            {s.status}
                          </div>
                        </div>
                      ))
                  }
                </div>
                <div className={styles.sgInsight}>💡 Your confidence improves during unscripted conversations.</div>
              </div>

              <div className={styles.sgCard}>
                <div className={styles.sgLabel}>
                  <span className={styles.sgDot} style={{ background: '#A78BFA' }} />Areas to Improve
                </div>
                <div className={styles.sgList}>
                  {isLoading
                    ? [1, 2, 3].map(i => (
                        <div key={i} className={styles.sgItem}>
                          <div style={{ width: '100%', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                        </div>
                      ))
                    : growthAreas.map((g, i) => (
                        <div key={i} className={styles.sgItem}>
                          <div className={styles.sgArrow}>→</div>
                          <div style={{ flex: 1 }}>
                            <div className={styles.sgText}>{g.text}</div>
                            <div className={styles.sgTip}>{g.tip}</div>
                          </div>
                        </div>
                      ))
                  }
                </div>
                <div className={styles.sgInsight}>🎯 Practice shorter pauses to sound more composed.</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Skill Radar */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Skill Radar</div>
                <div className={styles.cardSub}>Multidimensional communication analysis</div>
              </div>
            </div>
            <div className={styles.radarWrap}>
              <svg className={styles.radarSVG} viewBox="0 0 400 320">
                <circle cx="200" cy="160" r="108" fill="rgba(255,255,255,0.00)" stroke="rgba(255,255,255,0.025)" />
                <circle cx="200" cy="160" r="72" fill="none" stroke="rgba(255,255,255,0.015)" />
                <circle cx="200" cy="160" r="36" fill="none" stroke="rgba(255,255,255,0.01)" />
                {!isLoading && (
                  <polygon
                    points={radarPoints}
                    fill="rgba(139,92,246,0.1)"
                    stroke="rgba(167,139,250,0.35)"
                    strokeWidth="2.5"
                  />
                )}
                {!isLoading && radarPoints.split(' ').map((pt, i) => {
                  const [x, y] = pt.split(',');
                  return <circle key={i} cx={x} cy={y} r={5} fill="#CDBBFF" />;
                })}
                {radarLabelPositions.map((L, i) => (
                  <text key={`lab-${i}`} x={L.x} y={L.y} className={styles.radarLabel} textAnchor="middle">
                    {L.label.toUpperCase()}
                  </text>
                ))}
              </svg>
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  {isLoading ? '–' : overallScore}
                </div>
                <div className={styles.smallMuted}>
                  {overallScore >= 85 ? 'Overall — Excellent'
                    : overallScore >= 70 ? 'Overall — Good'
                    : overallScore >= 50 ? 'Overall — Developing'
                    : isLoading ? 'Loading…'
                    : 'Overall — Needs Work'}
                </div>
              </div>
            </div>
          </div>

          {/* Filler Words */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Filler Words</div>
                <div className={styles.cardSub}>Commonly used — hover to inspect</div>
              </div>
            </div>
            <div className={styles.fillerGrid}>
              {isLoading
                ? [1, 2, 3, 4].map(i => (
                    <div key={i} className={styles.fillerChip} style={{ opacity: 0.4 }}>
                      <div className={styles.fillerWord}>···</div>
                      <div className={styles.fillerCount}>–</div>
                    </div>
                  ))
                : fillerWords.length === 0
                  ? <div style={{ color: C.textMuted, fontSize: 13 }}>🎉 No filler words detected!</div>
                  : fillerWords.map(({ word, count }, i) => (
                      <div key={i} className={styles.fillerChip} title={`${word} — ${count} times`}>
                        <div className={styles.fillerWord}>{word}</div>
                        <div className={styles.fillerCount}>{count}</div>
                      </div>
                    ))
              }
            </div>
          </div>

          {/* Communication Milestones */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Communication Milestones</div>
                <div className={styles.cardSub}>Your progress timeline</div>
              </div>
            </div>
            <div className={styles.milestoneList}>
              {isLoading
                ? [1, 2, 3].map(i => (
                    <div key={i} className={styles.milestoneItem}>
                      <div className={styles.milestoneIcon} style={{ opacity: 0.3 }}>⏳</div>
                      <div style={{ width: '60%', height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                    </div>
                  ))
                : milestones.map((ms, i) => (
                    <div key={i} className={styles.milestoneItem}>
                      <div className={`${styles.milestoneIcon} ${ms.done ? styles.milestoneDone : styles.milestonePending}`}>
                        {ms.done ? '✓' : '⏳'}
                      </div>
                      <div className={ms.done ? styles.milestoneLabel : styles.milestoneLabelPending}>
                        {ms.label}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions — full width */}
      <div className={styles.cardPremium}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Recent Sessions</div>
            <div className={styles.cardSub}>Latest feedback &amp; takeaways</div>
          </div>
        </div>
        <div className={styles.sessionsRow}>
          {isLoading
            ? [1, 2, 3].map(i => (
                <div key={i} className={styles.sessionCardPremium} style={{ opacity: 0.4 }}>
                  <div style={{ width: '60%', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                </div>
              ))
            : sessions.length === 0
              ? <div style={{ color: C.textMuted, fontSize: 13 }}>No sessions yet. Start your first mock interview!</div>
              : sessions.map((s, i) => (
                  <div
                    key={`${s.id || s.sessionId || 'session'}-${i}`}
                    className={styles.sessionCardPremium}
                    onClick={() => router.push(`/report?id=${s.id || ''}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: 'linear-gradient(135deg,#8B5CF6,#A78BFA)',
                        display: 'grid', placeItems: 'center',
                        fontWeight: 800, fontSize: 14, color: '#fff',
                      }}>
                        {(s.title || 'S').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</div>
                        <div className={styles.smallMuted}>{s.date} · {s.dur}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: 900, fontSize: 16,
                        color: s.score >= 90 ? C.success : s.score >= 75 ? C.primary : C.warning,
                      }}>
                        {s.score}
                      </div>
                      <div className={styles.smallMuted} style={{ marginTop: 4 }}>
                        {s.best} · needs {s.area}
                      </div>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  );
}
