"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, ScoreRing, Tag } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';

const ReportPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedQ, setExpandedQ] = useState(null);

  const displayName = user?.profileResume?.personalInfo?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profileResume?.personalInfo?.avatar || user?.photoURL || user?.avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();

  const overallScore = 84;
  const verdict = overallScore >= 85 ? 'Strong Hire' : overallScore >= 70 ? 'Lean Hire' : 'Needs Improvement';
  const verdictColor = overallScore >= 85 ? C.success : overallScore >= 70 ? C.primary : C.warning;

  const sectionLabel = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const thinBar = (pct, color) => (
    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', marginTop: 5 }}>
      <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, transition: 'width 1.2s ease' }} />
    </div>
  );

  const performanceGroups = [
    {
      title: 'Communication', color: C.primary,
      items: [
        { label: 'Confidence level', pct: 82 },
        { label: 'Clarity of thought', pct: 74 },
        { label: 'Speaking pace', pct: 65 },
        { label: 'Filler word control', pct: 42 },
      ]
    },
    {
      title: 'Technical', color: C.warning,
      items: [
        { label: 'Code correctness', pct: 96 },
        { label: 'Algorithm efficiency', pct: 88 },
        { label: 'Edge case handling', pct: 70 },
        { label: 'Code readability', pct: 82 },
      ]
    },
    {
      title: 'Behavioral', color: C.success,
      items: [
        { label: 'STAR method usage', pct: 88 },
        { label: 'Storytelling depth', pct: 85 },
        { label: 'Leadership examples', pct: 72 },
        { label: 'Eye contact', pct: 74 },
      ]
    },
  ];

  const feedback = [
    { icon: '✓', title: 'Excellent technical depth', body: 'Strong knowledge of system design patterns, particularly distributed caching strategies.', type: 'positive' },
    { icon: '→', title: 'Improve pacing', body: 'You spoke at 180+ words/min in key sections. Practice deliberate pauses after key points.', type: 'improve' },
    { icon: '✓', title: 'Strong storytelling', body: 'Behavioral answers followed STAR method with concrete outcomes and measurable impact.', type: 'positive' },
    { icon: '→', title: 'Reduce hedging language', body: 'Phrases like "I think maybe" undermine confidence. Use direct, assertive statements.', type: 'improve' },
  ];

  const questions = [
    { q: 'Q1', label: 'Tell me about yourself', score: 88, type: 'HR', feedback: 'Clear and concise introduction. Good structure mentioning experience, skills, and goals.' },
    { q: 'Q2', label: 'Leadership challenge', score: 76, type: 'Behavioral', feedback: 'Used STAR format but impact metrics could be stronger. Add quantifiable results.' },
    { q: 'Q3', label: 'Two Sum (LeetCode)', score: 94, type: 'Coding', feedback: 'Optimal O(n) solution with hash map. Excellent code quality and clear explanation.' },
    { q: 'Q4', label: 'Explain time complexity', score: 91, type: 'Technical', feedback: 'Strong understanding of Big-O. Well-articulated explanation with examples.' },
    { q: 'Q5', label: 'Conflict resolution', score: 79, type: 'Behavioral', feedback: 'Good example but could elaborate more on the resolution process and outcome.' },
    { q: 'Q6', label: 'Why this company?', score: 83, type: 'HR', feedback: 'Showed research but could connect personal values more to company mission.' },
  ];

  const typeColors = { HR: C.success, Behavioral: C.secondary, Coding: C.warning, Technical: C.primary };
  const scoreColor = (s) => s >= 88 ? C.success : s >= 75 ? C.primary : C.warning;

  return (
    <div style={{ flex: 1, height: '100vh', overflow: 'auto', padding: '28px 32px' }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            color: '#fff', fontSize: 20, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Interview Analysis</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px 0', color: C.textPrimary }}>{displayName}&apos;s Session Report</h2>
            <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>Senior SWE · Google · April 30, 2026 · 24 min</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <NeonButton variant="outline" size="sm">Download PDF</NeonButton>
          <NeonButton size="sm" onClick={() => router.push('/solo-select')}>Retry →</NeonButton>
        </div>
      </div>

      {/* ═══ SCORE HERO ═══ */}
      <div style={{
        padding: '28px 32px', borderRadius: 14, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.04))',
        border: '1px solid rgba(139,92,246,0.1)',
        display: 'flex', alignItems: 'center', gap: 40,
      }}>
        {/* Big Score */}
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{
            fontSize: 64, fontWeight: 900, lineHeight: 1,
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{overallScore}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Overall Score</div>
          <div style={{
            marginTop: 8, padding: '3px 12px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: `${verdictColor}15`, color: verdictColor, display: 'inline-block',
            border: `1px solid ${verdictColor}25`,
          }}>{verdict}</div>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.06)' }} />

        {/* Category Rings */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: 'Confidence', value: 82, color: C.primary },
            { label: 'Tone', value: 89, color: C.success },
            { label: 'Clarity', value: 74, color: C.secondary },
            { label: 'Coding', value: 91, color: C.warning },
          ].map(s => <ScoreRing key={s.label} value={s.value} label={s.label} color={s.color} size={80} />)}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.06)' }} />

        {/* Quick Summary */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>AI Summary</div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
            Strong technical performance with optimal coding solutions. Communication is clear but pacing needs work. Behavioral responses are well-structured using STAR method.
          </div>
        </div>
      </div>

      {/* ═══ PERFORMANCE BREAKDOWN + AI FEEDBACK ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>

        {/* Performance Breakdown - Grouped */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={sectionLabel}>Performance Breakdown</div>
          {performanceGroups.map((group, gi) => (
            <div key={group.title} style={{ marginBottom: gi < performanceGroups.length - 1 ? 18 : 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: group.color, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10,
                paddingBottom: 6, borderBottom: `1px solid ${group.color}15`,
              }}>{group.title}</div>
              {group.items.map(({ label, pct }) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: C.textPrimary }}>{label}</span>
                    <span style={{ fontSize: 11, color: scoreColor(pct), fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{pct}%</span>
                  </div>
                  {thinBar(pct, group.color)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={sectionLabel}>AI Feedback</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feedback.map((f, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 10,
                background: f.type === 'positive' ? 'rgba(34,197,94,0.04)' : 'rgba(245,158,11,0.04)',
                border: `1px solid ${f.type === 'positive' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    background: f.type === 'positive' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                    color: f.type === 'positive' ? C.success : C.warning,
                  }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: f.type === 'positive' ? C.success : C.warning }}>{f.title}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, paddingLeft: 28 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CODING ROUND + QUESTION REVIEW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14, marginBottom: 24 }}>

        {/* Coding Round */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.03), rgba(6,182,212,0.02))',
          border: '1px solid rgba(245,158,11,0.1)',
        }}>
          <div style={sectionLabel}>Coding Round — Two Sum</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <ScoreRing value={91} label="" color={C.warning} size={64} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.warning, fontFamily: 'JetBrains Mono' }}>91/100</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Coding Score</div>
            </div>
          </div>
          {[
            { label: 'Runtime', val: '72 ms — 94.7%', color: C.success },
            { label: 'Memory', val: '42.1 MB — 87.2%', color: C.secondary },
            { label: 'Tests Passed', val: '42 / 42', color: C.success },
            { label: 'Time Taken', val: '20:47', color: C.warning },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: C.textMuted }}>{m.label}</span>
              <span style={{ color: m.color, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{m.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
            {['Hash Map', 'O(n) Time', 'Single Pass', 'Optimal'].map(t => (
              <span key={t} style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: `${C.warning}12`, color: C.warning, border: `1px solid ${C.warning}20`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Question-by-Question Accordion */}
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={sectionLabel}>Question-by-Question Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map(({ q, label, score, type, feedback: fb }) => {
              const isOpen = expandedQ === q;
              return (
                <div key={q} onClick={() => setExpandedQ(isOpen ? null : q)} style={{
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                  background: isOpen ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${isOpen ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: C.textMuted, width: 22 }}>{q}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{label}</div>
                    </div>
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 3, fontWeight: 600,
                      background: `${typeColors[type]}12`, color: typeColors[type],
                    }}>{type}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: scoreColor(score), minWidth: 28, textAlign: 'right' }}>{score}</span>
                    <span style={{ fontSize: 10, color: C.textMuted, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                  </div>
                  {isOpen && (
                    <div style={{
                      marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 12, color: C.textSecondary, lineHeight: 1.7, paddingLeft: 32,
                    }}>
                      <span style={{ color: C.primary, fontWeight: 600 }}>AI Feedback: </span>{fb}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
