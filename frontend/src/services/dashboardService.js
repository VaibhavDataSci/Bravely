/**
 * Dashboard API service.
 * All calls go through the centralized apiFetch client.
 * Import this in hooks/useDashboard.js — never directly in components.
 */

import { apiFetch } from './api';

/**
 * GET /api/dashboard/summary
 * Returns { streak, metrics, strengths, growthAreas }
 */
export async function fetchSummary() {
  return apiFetch('/api/dashboard/summary');
}

/**
 * GET /api/dashboard/performance?range=7|30
 * Returns { range, points: [{ label, score, period }] }
 */
export async function fetchPerformance(range = '7') {
  return apiFetch(`/api/dashboard/performance?range=${range}`);
}

/**
 * GET /api/dashboard/sessions?limit=5
 * Returns { sessions: [...] }
 */
export async function fetchSessions(limit = 5) {
  return apiFetch(`/api/dashboard/sessions?limit=${limit}`);
}

/**
 * GET /api/dashboard/milestones
 * Returns { milestones: [...] }
 */
export async function fetchMilestones() {
  return apiFetch('/api/dashboard/milestones');
}

/**
 * GET /api/dashboard/filler-words
 * Returns { words: [{ word, count }] }
 */
export async function fetchFillerWords() {
  return apiFetch('/api/dashboard/filler-words');
}
