'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { checkHealth } from '@/services/api';
import {
  fetchSummary,
  fetchPerformance,
  fetchSessions,
  fetchMilestones,
  fetchFillerWords,
} from '@/services/dashboardService';
import { MOCK_DASHBOARD } from '@/mock-data/dashboard';

const STALE_AFTER_MS = 60_000; // refresh live data every 60s

/**
 * useDashboard — data hook for the Dashboard page.
 *
 * Strategy:
 *   1. On mount, ping /health (3s timeout).
 *   2. If reachable → fetch all 5 dashboard endpoints in parallel.
 *   3. If any endpoint fails (network error, 5xx, timeout) → fall back to
 *      MOCK_DASHBOARD for that slice only (graceful partial fallback).
 *   4. If health check itself fails → use full mock, show offline banner.
 *   5. Re-fetches live data every 60s if backend is reachable.
 *
 * Returns:
 *   { data, isLoading, isMock, error, refetch }
 */
export function useDashboard(range = '7') {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const backendAliveRef = useRef(true);

  const load = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);

    // ── Step 1: Health check ─────────────────────────────────────────────────
    const alive = await checkHealth();
    backendAliveRef.current = alive;

    if (!alive) {
      // Backend completely offline → full mock
      setData(buildMockForRange(range));
      setIsMock(true);
      setIsLoading(false);
      setError('Backend is currently unreachable. Showing demo data.');
      return;
    }

    // ── Step 2: Fetch all slices in parallel, fall back per-slice ────────────
    const [summary, performance, sessions, milestones, fillerWords] =
      await Promise.all([
        safeFetch(() => fetchSummary(), MOCK_DASHBOARD.summary),
        safeFetch(() => fetchPerformance(range), { points: MOCK_DASHBOARD.performance[range] || [] }),
        safeFetch(() => fetchSessions(5), { sessions: MOCK_DASHBOARD.sessions }),
        safeFetch(() => fetchMilestones(), { milestones: MOCK_DASHBOARD.milestones }),
        safeFetch(() => fetchFillerWords(), { words: MOCK_DASHBOARD.fillerWords }),
      ]);

    const anyMock =
      summary.__mock || performance.__mock ||
      sessions.__mock || milestones.__mock || fillerWords.__mock;

    setData({
      streak:      summary.streak        ?? MOCK_DASHBOARD.summary.streak,
      metrics:     summary.metrics       ?? MOCK_DASHBOARD.summary.metrics,
      strengths:   summary.strengths     ?? MOCK_DASHBOARD.summary.strengths,
      growthAreas: summary.growthAreas   ?? MOCK_DASHBOARD.summary.growthAreas,
      perfPoints:  mapPerfPoints(performance.points || []),
      sessions:    sessions.sessions     ?? MOCK_DASHBOARD.sessions,
      milestones:  milestones.milestones ?? MOCK_DASHBOARD.milestones,
      fillerWords: fillerWords.words     ?? MOCK_DASHBOARD.fillerWords,
    });

    setIsMock(!!anyMock);
    setIsLoading(false);
  }, [range]);

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    const bootstrap = setTimeout(() => load(true), 0);

    intervalRef.current = setInterval(() => {
      if (backendAliveRef.current) {
        load(false);
      }
    }, STALE_AFTER_MS);

    return () => {
      clearTimeout(bootstrap);
      clearInterval(intervalRef.current);
    };
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return { data, isLoading, isMock, error, refetch };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Attempt a fetch; on failure return fallback with __mock flag. */
async function safeFetch(fn, fallback) {
  try {
    const result = await fn();
    return result;
  } catch {
    return { ...fallback, __mock: true };
  }
}

/** Map backend performance points to SVG coordinate objects */
function mapPerfPoints(points) {
  if (!points || points.length === 0) return [];

  const SVG_W = 900;
  const SVG_H = 440;
  const PADDING = { left: 60, right: 60, top: 30, bottom: 50 };
  const plotW = SVG_W - PADDING.left - PADDING.right;
  const plotH = SVG_H - PADDING.top - PADDING.bottom;

  const scores = points.map(p => p.score || 0);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);
  const scoreRange = maxScore - minScore || 1;

  return points.map((p, i) => ({
    x: PADDING.left + (i / Math.max(points.length - 1, 1)) * plotW,
    y: PADDING.top + plotH - ((p.score - minScore) / scoreRange) * plotH,
    label: p.label || '',
    score: p.score,
  }));
}

function buildMockForRange(range) {
  const points = MOCK_DASHBOARD.performance[range] || MOCK_DASHBOARD.performance['7'];
  return {
    streak:      MOCK_DASHBOARD.summary.streak,
    metrics:     MOCK_DASHBOARD.summary.metrics,
    strengths:   MOCK_DASHBOARD.summary.strengths,
    growthAreas: MOCK_DASHBOARD.summary.growthAreas,
    perfPoints:  mapPerfPoints(points),
    sessions:    MOCK_DASHBOARD.sessions,
    milestones:  MOCK_DASHBOARD.milestones,
    fillerWords: MOCK_DASHBOARD.fillerWords,
  };
}
