"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, Tag, ScoreRing } from '@/components/shared';

// ─── PAGE 6: ANALYSIS REPORT ──────────────────────────────────────────────────
const ReportPage = () => {
  const router = useRouter();

  const bigScores = [
    { label: 'Confidence', value: 82, color: C.primary },
    { label: 'Tone', value: 89, color: C.success },
    { label: 'Clarity', value: 74, color: C.secondary },
    { label: 'Coding', value: 91, color: C.warning },
  ];
  return (
    <div style={{ flex: 1, height: '100vh', overflow: 'auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Interview Analysis</h2>
          <p style={{ color: C.textSecondary, fontSize: 14 }}>Senior SWE · Google · April 30, 2026 · 24 min</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <NeonButton variant="outline" size="sm">Download PDF</NeonButton>
          <NeonButton size="sm" onClick={() => router.push('/solo')}>Retry Interview →</NeonButton>
        </div>
      </div>
      {/* Overall score */}
      <GlassCard style={{ marginBottom: 24, padding: '32px', textAlign: 'center', background: `linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.06))` }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 60 }}>
          <div>
            <div style={{ fontSize: 80, fontWeight: 900, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>84</div>
            <div style={{ fontSize: 16, color: C.textSecondary, marginTop: 4 }}>Overall Score</div>
            <Tag color={C.success} style={{ marginTop: 8 }}>Above Average</Tag>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {bigScores.map(s => <ScoreRing key={s.label} value={s.value} label={s.label} color={s.color} size={100} />)}
          </div>
        </div>
      </GlassCard>
      {/* Metrics + AI summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Performance Breakdown</div>
          {[
            { label: 'STAR method usage', pct: 88, c: C.success },
            { label: 'Technical accuracy', pct: 92, c: C.success },
            { label: 'Code correctness', pct: 96, c: C.success },
            { label: 'Algorithm efficiency', pct: 88, c: C.primary },
            { label: 'Code readability', pct: 82, c: C.primary },
            { label: 'Eye contact', pct: 74, c: C.primary },
            { label: 'Speaking pace', pct: 65, c: C.warning },
            { label: 'Filler word frequency', pct: 42, c: C.error },
            { label: 'Edge case handling', pct: 70, c: C.warning },
          ].map(({ label, pct, c }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: C.textPrimary }}>{label}</span>
                <span style={{ fontSize: 12, color: c, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{pct}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${c}60, ${c})`, transition: 'width 1.5s ease' }} />
              </div>
            </div>
          ))}
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>AI Feedback Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Excellent technical depth', body: 'You demonstrated strong knowledge of system design patterns, particularly in your discussion of distributed caching strategies.', type: 'positive' },
              { title: 'Improve pacing', body: 'You spoke at 180+ words/min in key sections. Practice deliberate pauses after making key points to let ideas land.', type: 'improve' },
              { title: 'Strong storytelling', body: 'Your behavioral answers followed STAR method effectively with concrete outcomes and measurable impact.', type: 'positive' },
              { title: 'Reduce hedging language', body: 'Phrases like "I think maybe" and "sort of" undermine confidence. Use direct, assertive statements.', type: 'improve' },
            ].map(({ title, body, type }, i) => (
              <div key={i} style={{
                borderRadius: 10, padding: '14px 16px',
                background: type === 'positive' ? `${C.success}08` : `${C.warning}08`,
                border: `1px solid ${type === 'positive' ? C.success + '25' : C.warning + '25'}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: type === 'positive' ? C.success : C.warning, marginBottom: 6 }}>
                  {type === 'positive' ? '✓' : '→'} {title}
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      {/* Coding round + question scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Coding round breakdown */}
        <GlassCard style={{ background: `linear-gradient(135deg, rgba(245,158,11,0.04), rgba(6,182,212,0.04))` }}>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Coding Round — Two Sum</div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
            <ScoreRing value={91} label="Coding Score" color={C.warning} size={90} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: C.textSecondary }}>Runtime</span>
                <span style={{ color: C.success, fontFamily: 'JetBrains Mono' }}>72 ms — 94.7%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: C.textSecondary }}>Memory</span>
                <span style={{ color: C.secondary, fontFamily: 'JetBrains Mono' }}>42.1 MB — 87.2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: C.textSecondary }}>Tests Passed</span>
                <span style={{ color: C.success, fontFamily: 'JetBrains Mono' }}>42 / 42</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: C.textSecondary }}>Time Taken</span>
                <span style={{ color: C.warning, fontFamily: 'JetBrains Mono' }}>20:47</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Hash Map', 'O(n) Time', 'Single Pass', 'Optimal'].map(t => (
              <Tag key={t} color={C.warning}>{t}</Tag>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', background: `${C.success}08`, borderRadius: 8, border: `1px solid ${C.success}25` }}>
            <div style={{ fontSize: 12, color: C.success, fontWeight: 700, marginBottom: 4 }}>✓ AI Interviewer Note</div>
            <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
              You clearly explained your O(n) approach before coding — a strong signal for communication skills in technical rounds.
            </div>
          </div>
        </GlassCard>

        {/* Question scores */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Score by Question</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { q: 'Q1', label: 'Tell me about yourself', score: 88, type: 'HR' },
              { q: 'Q2', label: 'Leadership challenge', score: 76, type: 'Behavioral' },
              { q: 'Q3', label: 'Two Sum (LeetCode)', score: 94, type: 'Coding' },
              { q: 'Q4', label: 'Explain time complexity', score: 91, type: 'Technical' },
              { q: 'Q5', label: 'Conflict resolution', score: 79, type: 'Behavioral' },
              { q: 'Q6', label: 'Why this company?', score: 83, type: 'HR' },
            ].map(({ q, label, score, type }) => (
              <div key={q} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: C.bgCard, borderRadius: 8, border: `1px solid ${C.borderMid}`,
              }}>
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: C.textMuted, width: 20 }}>{q}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <Tag color={type === 'Coding' ? C.warning : type === 'Technical' ? C.primary : type === 'HR' ? C.success : C.secondary}>{type}</Tag>
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono',
                  color: score >= 88 ? C.success : score >= 75 ? C.primary : C.warning,
                }}>{score}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ─── PAGE 7: PROFILE ──────────────────────────────────────────────────────────

export default ReportPage;
