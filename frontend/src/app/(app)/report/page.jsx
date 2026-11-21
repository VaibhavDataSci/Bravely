"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { MODE_LABELS, PART_LABELS, SCORE_NOTICE } from '@/lib/scoreNotice';
import styles from './Report.module.css';

const CONFIDENCE_TEXT = {
  good: 'Higher confidence: enough speech and a checked AI judgement.',
  fair: 'Medium confidence: treat the score as a rough guide.',
  low: 'Low confidence: short or partly unchecked. Treat this as a rough guide only.',
  none: 'Not scored.',
};

const formatDate = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function ReportPage() {
  const [state, setState] = useState({ status: 'loading', report: null, error: null });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api('/api/reports/latest')
      .then(({ report }) => { if (!cancelled) setState({ status: report ? 'ready' : 'empty', report, error: null }); })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', report: null, error: err instanceof ApiError ? err.message : 'Could not load your report.' });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => { setState({ status: 'loading', report: null, error: null }); setAttempt((n) => n + 1); };

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
        <h1>We couldn&apos;t load your report</h1>
        <p>{state.error}</p>
        <div className={styles.actions}><button type="button" className="bv-btn bv-btn--primary" onClick={retry}>Try again</button></div>
      </div></div>
    );
  }
  if (state.status === 'empty') {
    return (
      <div className={styles.page}><div className={styles.state}>
        <h1>No report yet</h1>
        <p>Finish a practice session and your scored report appears here.</p>
        <div className={styles.actions}><Link href="/solo-select" className="bv-btn bv-btn--primary">Start practising</Link></div>
      </div></div>
    );
  }

  const { report } = state;
  const { fluency, metrics, feedback } = report;
  const scored = fluency?.score != null;
  const parts = Object.entries(fluency?.parts || {}).filter(([, v]) => typeof v === 'number');
  const minutes = report.durationSec ? Math.max(1, Math.round(report.durationSec / 60)) : null;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Session report</div>
            <h1 className={styles.title}>{MODE_LABELS[report.mode] || 'Practice'}{report.topic ? ` · ${report.topic}` : ''}</h1>
            <p className={styles.meta}>{formatDate(report.createdAt)}{minutes ? ` · ${minutes} min` : ''} · {metrics?.wordCount ?? 0} words</p>
          </div>
          <div className={styles.actions}>
            <Link href="/dashboard" className="bv-btn bv-btn--secondary">Dashboard</Link>
            <Link href="/solo-select" className="bv-btn bv-btn--primary">Practise again</Link>
          </div>
        </div>

        <section className={styles.hero} aria-label="Overall fluency score">
          <div>
            <div className={styles.score}>{scored ? fluency.score : '—'}</div>
            <div className={styles.scoreSub}>
              {scored ? `Likely range ${fluency.range[0]}–${fluency.range[1]}` : 'Not scored'}
              <span className={styles.badge}>{fluency.band}</span>
            </div>
          </div>
          <p className={styles.heroNote}>
            {scored ? CONFIDENCE_TEXT[fluency.confidence] : fluency.reason}
            {report.degraded && scored ? ' The AI judgement was unavailable, so structure and relevance are not included.' : ''}
          </p>
        </section>

        {parts.length > 0 && (
          <section className={styles.section} aria-label="Score breakdown">
            <h2 className={styles.h2}>Breakdown</h2>
            <div className={styles.parts}>
              {parts.map(([key, value]) => (
                <div key={key}>
                  <div className={styles.partTop}><span>{PART_LABELS[key] || key}</span><span>{Math.round(value)}</span></div>
                  <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={PART_LABELS[key] || key}>
                    <div className={styles.fill} style={{ width: `${Math.round(value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} aria-label="Measured speech">
          <h2 className={styles.h2}>Measured from your audio</h2>
          <div className={styles.list}>
            <span>Pace: {metrics?.wpm ? `${metrics.wpm} words per minute (${metrics.pace}). A comfortable range is 120 to 160.` : 'not measured'}</span>
            <span>Filler words: at least {metrics?.fillers?.counted ?? 0}. Speech-to-text often drops fillers, so the real number is probably higher.</span>
            <span>Long pauses (1.5 s or more): {metrics?.longPauses ?? 0}</span>
          </div>
        </section>

        {feedback && (
          <section className={styles.section} aria-label="AI feedback">
            <h2 className={styles.h2}>AI feedback</h2>
            <div className={styles.list}>
              {feedback.strengths?.length > 0 && (<div><strong>What worked</strong><ul>{feedback.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>)}
              {feedback.improvement && <div><strong>Work on next</strong><p>{feedback.improvement}</p></div>}
              {feedback.structureEvidence && <p className={styles.quote}>&ldquo;{feedback.structureEvidence}&rdquo;</p>}
              {feedback.star && (
                <div className={styles.star} aria-label="Story structure">
                  {Object.entries(feedback.star).map(([k, on]) => (
                    <span key={k} className={`${styles.chip} ${on ? styles.chipOn : ''}`}>{on ? '✓' : '–'} {k}</span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className={styles.section} aria-label="Transcript">
          <h2 className={styles.h2}>Transcript</h2>
          <p className={styles.transcript}>{report.transcript}</p>
        </section>

        <p className={styles.notice}>{SCORE_NOTICE}</p>
      </div>
    </div>
  );
}
