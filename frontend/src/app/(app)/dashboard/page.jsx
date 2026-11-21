"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MODE_LABELS, PART_LABELS } from '@/lib/scoreNotice';
import styles from './Dashboard.module.css';

const FOCUS_TIPS = {
  pace: 'Aim for 120 to 160 words per minute. Pause after each key point.',
  fillers: 'Swap "um" and "like" for a short silent pause.',
  vocabulary: 'Replace generic words with specific ones.',
  pauses: 'Long gaps break flow. Plan your first sentence before you start.',
  structure: 'Open with the point, give one example, close with the result.',
  relevance: 'Answer the question asked first, then add detail.',
};

function Trend({ points }) {
  if (points.length < 2) {
    return <p className={styles.muted}>Practise on two different days to see your trend.</p>;
  }
  const W = 560, H = 180, P = 24;
  const x = (i) => P + (i * (W - P * 2)) / (points.length - 1);
  const y = (s) => H - P - (s / 100) * (H - P * 2);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Average score by day: ${points.map((p) => `${p.day} ${p.score}`).join(', ')}`}>
      <line className={styles.axis} x1={P} y1={H - P} x2={W - P} y2={H - P} />
      <path className={styles.line} d={path} />
      {points.map((p, i) => <circle key={p.day} className={styles.dot} cx={x(i)} cy={y(p.score)} r="3" />)}
      <text className={styles.tick} x={P} y={H - 6}>{points[0].day.slice(5)}</text>
      <text className={styles.tick} x={W - P} y={H - 6} textAnchor="end">{points.at(-1).day.slice(5)}</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api('/api/dashboard/summary')
      .then((data) => { if (!cancelled) setState({ status: 'ready', data, error: null }); })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', data: null, error: err instanceof ApiError ? err.message : 'Could not load your dashboard.' });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => { setState({ status: 'loading', data: null, error: null }); setAttempt((n) => n + 1); };

  if (state.status === 'loading') {
    return (
      <div className={styles.page} aria-busy="true"><div className={styles.wrap}>
        <div className={styles.skeleton} /><div className={styles.skeleton} /><div className={styles.skeleton} />
      </div></div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className={styles.page}><div className={styles.state} role="alert">
        <h1>We couldn&apos;t load your dashboard</h1>
        <p>{state.error}</p>
        <div className={styles.actions}><button type="button" className="bv-btn bv-btn--primary" onClick={retry}>Try again</button></div>
      </div></div>
    );
  }

  const { data } = state;
  const { progress, totals, trend, recent, focus } = data;
  const name = (data.user?.name || user?.name || 'there').split(' ')[0];
  const empty = totals.sessions === 0;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Dashboard</div>
            <h1 className={styles.title}>Welcome back, {name}</h1>
            <p className={styles.sub}>{empty ? 'Record your first answer to start your streak.' : progress.streak > 0 ? `${progress.streak}-day streak. Keep it going today.` : 'Practise today to start a new streak.'}</p>
          </div>
          <Link href="/solo-select" className="bv-btn bv-btn--primary">Start practising</Link>
        </div>

        <div className={styles.tiles}>
          <div className={styles.tile}><div className={styles.tileLabel}>Current streak</div><div className={styles.tileValue}>{progress.streak}</div><div className={styles.tileNote}>Best: {progress.bestStreak} days</div></div>
          <div className={styles.tile}>
            <div className={styles.tileLabel}>Level {progress.level}</div><div className={styles.tileValue}>{progress.xp} XP</div>
            <div className={styles.xp} role="progressbar" aria-valuenow={progress.xpIntoLevel} aria-valuemin={0} aria-valuemax={progress.xpForNext} aria-label="XP to next level"><div className={styles.xpFill} style={{ width: `${(progress.xpIntoLevel / progress.xpForNext) * 100}%` }} /></div>
            <div className={styles.tileNote}>{progress.xpForNext - progress.xpIntoLevel} XP to level {progress.level + 1}</div>
          </div>
          <div className={styles.tile}><div className={styles.tileLabel}>Sessions</div><div className={styles.tileValue}>{totals.sessions}</div><div className={styles.tileNote}>{totals.minutes} min practised</div></div>
          <div className={styles.tile}><div className={styles.tileLabel}>Average score</div><div className={styles.tileValue}>{totals.averageScore ?? '—'}</div><div className={styles.tileNote}>{totals.bestScore != null ? `Best: ${totals.bestScore}` : 'No scored sessions yet'}</div></div>
        </div>

        <div className={styles.cols}>
          <section className={styles.card} aria-label="Score trend">
            <h2 className={styles.h2}>Last 14 days</h2>
            <Trend points={trend} />
          </section>
          <section className={styles.card} aria-label="What to practise next">
            <h2 className={styles.h2}>Focus next</h2>
            {focus ? (
              <>
                <p><strong>{PART_LABELS[focus.weakest.part] || focus.weakest.part}</strong> averages {focus.weakest.score}, your lowest area.</p>
                <p className={styles.muted} style={{ marginTop: 8 }}>{FOCUS_TIPS[focus.weakest.part]}</p>
                <p className={styles.muted} style={{ marginTop: 8 }}>Strongest: {PART_LABELS[focus.strongest.part] || focus.strongest.part} ({focus.strongest.score}).</p>
              </>
            ) : <p className={styles.muted}>Finish a scored session and your focus area appears here.</p>}
          </section>
        </div>

        <section className={styles.card} aria-label="Recent sessions">
          <h2 className={styles.h2}>Recent sessions</h2>
          {recent.length === 0 ? <p className={styles.muted}>Nothing yet. Your sessions will be listed here.</p> : (
            <div className={styles.rows}>
              {recent.map((s) => (
                <div key={s.id} className={styles.row}>
                  <span>{MODE_LABELS[s.mode] || 'Practice'}{s.topic ? ` · ${s.topic}` : ''} <span className={styles.muted}>{new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></span>
                  <span className={styles.rowScore}>{s.score ?? 'Not scored'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <p className={styles.muted}>Scores are practice estimates from automated speech-to-text and AI, not an exam or hiring assessment.</p>
      </div>
    </div>
  );
}
