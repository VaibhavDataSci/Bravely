const crypto = require('crypto');

const state = {
  usersByEmail: new Map(),
  sessions: new Map(),
  reports: [],
  activityByUserId: new Map(),
};

function makeId(prefix) {
  const seed = `${Date.now()}-${Math.random()}`;
  return `${prefix}_${crypto.createHash('md5').update(seed).digest('hex').slice(0, 10)}`;
}

function normalizeRole(roleId) {
  const map = {
    se: 'Software Engineer',
    pm: 'Product Manager',
    da: 'Data Analyst',
    hr: 'HR / People Ops',
    sd: 'System Design',
  };
  return map[roleId] || 'Interview';
}

function dayKey(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(previousDay, nextDay) {
  if (!previousDay || !nextDay) return null;
  const previous = new Date(`${previousDay}T00:00:00.000Z`).getTime();
  const next = new Date(`${nextDay}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(previous) || !Number.isFinite(next)) return null;
  return Math.round((next - previous) / (24 * 60 * 60 * 1000));
}

function normalizeStreak(streak = {}) {
  const current = Number(streak.current);
  return {
    current: Number.isFinite(current) && current > 0 ? Math.round(current) : 0,
    lastActiveDate: streak.lastActiveDate || null,
    lastActivityType: streak.lastActivityType || null,
  };
}

function markUserActivity(userId, activityType = 'activity', at = new Date()) {
  if (!userId) return { current: 0, lastActiveDate: null, lastActivityType: null };

  const today = dayKey(at);
  const existing = normalizeStreak(state.activityByUserId.get(userId));
  const lastDay = existing.lastActiveDate ? dayKey(existing.lastActiveDate) : null;
  const gap = daysBetween(lastDay, today);

  let current = existing.current || 0;
  if (!lastDay) {
    current = 1;
  } else if (gap === 0) {
    current = Math.max(1, current);
  } else if (gap === 1) {
    current += 1;
  } else if (gap > 1) {
    current = 1;
  }

  const next = {
    current,
    lastActiveDate: new Date(at).toISOString(),
    lastActivityType: activityType,
  };
  state.activityByUserId.set(userId, next);

  for (const user of state.usersByEmail.values()) {
    if (user.id === userId) {
      user.streak = next;
      break;
    }
  }

  return next;
}

function setUserStreak(userId, streak = {}) {
  if (!userId) return normalizeStreak(streak);
  const normalized = normalizeStreak(streak);
  state.activityByUserId.set(userId, normalized);
  for (const user of state.usersByEmail.values()) {
    if (user.id === userId) {
      user.streak = normalized;
      break;
    }
  }
  return normalized;
}

function createOrGetLocalUser({ email, name }) {
  const key = String(email || '').trim().toLowerCase();
  if (!key) return null;

  if (!state.usersByEmail.has(key)) {
    state.usersByEmail.set(key, {
      id: `local_${key.replace(/[^a-z0-9]/g, '_')}`,
      email: key,
      name: name || key.split('@')[0],
      role: 'user',
      streak: { current: 0, lastActiveDate: null, lastActivityType: null },
      preferences: { theme: 'dark' },
      createdAt: new Date().toISOString(),
    });
  }

  const existing = state.usersByEmail.get(key);
  if (name && !existing.name) existing.name = name;
  if (existing.streak?.lastActiveDate && !state.activityByUserId.has(existing.id)) {
    state.activityByUserId.set(existing.id, existing.streak);
  }
  return existing;
}

function createInterviewSession({ userId, config, resume, questions }) {
  markUserActivity(userId, 'interview_started');
  const sessionId = makeId('sess');
  const session = {
    id: sessionId,
    userId,
    type: 'solo',
    config: config || {},
    resume: resume || null,
    questions: questions || [],
    answers: [],
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'active',
  };
  state.sessions.set(sessionId, session);
  return session;
}

function addAnswer({ sessionId, answer }) {
  const session = state.sessions.get(sessionId);
  if (!session) return null;
  session.answers.push(answer);
  markUserActivity(session.userId, 'interview_answered');
  return session;
}

function endSession({ sessionId }) {
  const session = state.sessions.get(sessionId);
  if (!session) return null;
  session.status = 'completed';
  session.endedAt = new Date().toISOString();
  markUserActivity(session.userId, 'interview_completed');
  return session;
}

function createReportFromSession(session) {
  if (!session) return null;

  const existing = state.reports.find(r => r.sessionId === session.id);
  if (existing) return existing;

  const answers = session.answers || [];
  const scores = answers.map(a => Number(a?.analysis?.scores?.overall_score || 0)).filter(n => Number.isFinite(n));
  const avgOverall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const metricsRaw = {
    confidence: avgNum(answers, a => a?.analysis?.scores?.confidence_score),
    clarity: avgNum(answers, a => a?.analysis?.scores?.clarity_score),
    fluency: avgNum(answers, a => a?.analysis?.metrics?.words_per_minute ? Math.max(0, 100 - Math.abs(130 - a.analysis.metrics.words_per_minute)) : null),
    structure: avgNum(answers, a => a?.analysis?.scores?.star_score),
    vocabulary: avgNum(answers, a => a?.analysis?.scores?.vocabulary_score),
    posture: avgNum(answers, a => a?.posture?.score),
  };

  const metrics = Object.fromEntries(
    Object.entries(metricsRaw).map(([k, v]) => [k, Math.round(v || 0)])
  );

  const fillerWords = [];
  for (const ans of answers) {
    const detected = ans?.analysis?.analysis?.filler_words?.detected || [];
    for (const fw of detected) {
      fillerWords.push({ word: fw.word, count: fw.count || 1 });
    }
  }

  const report = {
    id: makeId('rpt'),
    sessionId: session.id,
    userId: session.userId,
    type: session.type,
    config: session.config,
    overallScore: avgOverall,
    verdict: avgOverall >= 80 ? 'Excellent' : avgOverall >= 65 ? 'Good' : 'Needs Practice',
    metrics,
    fillerWords,
    aiFeedback: answers
      .map(a => a?.analysis?.feedback?.actionable_tip)
      .filter(Boolean),
    createdAt: new Date().toISOString(),
  };

  state.reports.unshift(report);
  if (state.reports.length > 200) state.reports.length = 200;
  return report;
}

function createDailyReport({
  userId,
  mode = 'day-summary',
  prompt = '',
  category = '',
  analysis = {},
  durationSeconds,
  sessionId,
  createdAt = new Date().toISOString(),
}) {
  if (!userId) return null;

  const scores = analysis?.scores || {};
  const metricsRaw = analysis?.metrics || {};
  const wordsPerMinute = Number(metricsRaw.words_per_minute);
  const fluency = Number.isFinite(wordsPerMinute)
    ? Math.max(0, 100 - Math.abs(130 - wordsPerMinute))
    : 0;

  const metrics = {
    confidence: Math.round(Number(scores.confidence_score) || 0),
    clarity: Math.round(Number(scores.clarity_score) || 0),
    fluency: Math.round(fluency),
    structure: Math.round(Number(scores.star_score) || 0),
    vocabulary: Math.round(Number(scores.vocabulary_score) || 0),
    posture: 0,
  };

  const overallScore = Math.round(Number(scores.overall_score) || avgArray(Object.values(metrics)));
  const detected = analysis?.analysis?.filler_words?.detected || [];
  const fillerWords = detected.map((item) => ({
    word: item.word || 'um',
    count: Number(item.count) || 1,
  }));

  const report = {
    id: makeId('daily'),
    sessionId: sessionId || makeId('dailysess'),
    userId,
    type: 'daily',
    config: {
      mode,
      prompt,
      category,
    },
    overallScore,
    verdict: overallScore >= 80 ? 'Excellent' : overallScore >= 65 ? 'Good' : 'Needs Practice',
    metrics,
    fillerWords,
    aiFeedback: [analysis?.feedback?.actionable_tip].filter(Boolean),
    durationSeconds: Number.isFinite(Number(durationSeconds)) ? Math.max(1, Number(durationSeconds)) : null,
    createdAt,
  };

  state.reports.unshift(report);
  if (state.reports.length > 200) state.reports.length = 200;
  return report;
}

function getLatestReport(userId) {
  return state.reports.find(r => r.userId === userId) || null;
}

function getReportsForUser(userId, limit = 50) {
  return state.reports.filter(r => r.userId === userId).slice(0, limit);
}

function getDashboardSnapshot(userId, range = 7) {
  const reports = getReportsForUser(userId, 100);
  const streak = normalizeStreak(state.activityByUserId.get(userId));
  const now = Date.now();
  const rangeMs = (range === 30 ? 30 : 7) * 24 * 60 * 60 * 1000;
  const recent = reports.filter(r => (now - new Date(r.createdAt).getTime()) <= rangeMs);

  const metrics = {
    confidence: Math.round(avgArray(recent.map(r => r.metrics?.confidence || 0))),
    clarity: Math.round(avgArray(recent.map(r => r.metrics?.clarity || 0))),
    fluency: Math.round(avgArray(recent.map(r => r.metrics?.fluency || 0))),
    structure: Math.round(avgArray(recent.map(r => r.metrics?.structure || 0))),
    vocabulary: Math.round(avgArray(recent.map(r => r.metrics?.vocabulary || 0))),
    posture: Math.round(avgArray(recent.map(r => r.metrics?.posture || 0))),
    overall: Math.round(avgArray(recent.map(r => r.overallScore || 0))),
  };

  const strengths = Object.entries(metrics)
    .filter(([k, v]) => k !== 'overall' && v >= 70)
    .map(([k, v]) => ({ text: `Strong ${cap(k)}`, status: v >= 80 ? 'Stable' : 'Improving' }));

  const growthAreas = Object.entries(metrics)
    .filter(([k, v]) => k !== 'overall' && v < 70)
    .map(([k]) => ({ text: `Improve ${cap(k)}`, tip: `Practice focusing on ${k} in your next session.` }));

  const perfSource = [...recent].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const points = perfSource.map((r, idx) => ({
    label: range === 7 ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(r.createdAt).getDay()] || `D${idx + 1}` : `Wk${idx + 1}`,
    score: r.overallScore || 0,
    period: r.createdAt,
  }));

  const sessions = getReportsForUser(userId, 5).map((r, idx) => {
    const durationSeconds = Number(r.durationSeconds);
    const durationLabel = Number.isFinite(durationSeconds) && durationSeconds > 0
      ? `${Math.max(1, Math.round(durationSeconds / 60))}m`
      : `${Math.max(1, (idx + 1) * 3)}m`;
    return {
    id: r.id,
    sessionId: r.sessionId,
    title: buildSessionTitle(r),
    type: r.type || 'solo',
    date: timeSince(r.createdAt),
    score: Math.round(r.overallScore || 0),
    best: topMetric(r.metrics),
    area: lowMetric(r.metrics),
    dur: durationLabel,
    verdict: r.verdict,
  };
  });

  const fillerTotals = {};
  for (const r of recent) {
    for (const fw of r.fillerWords || []) {
      const w = fw.word || 'um';
      const c = fw.count || 1;
      fillerTotals[w] = (fillerTotals[w] || 0) + c;
    }
  }
  const fillerWords = Object.entries(fillerTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    streak,
    metrics,
    strengths,
    growthAreas,
    points,
    sessions,
    milestones: [
      { label: 'First AI Call Completed', done: reports.length >= 1 },
      { label: '7-Day Streak', done: streak.current >= 7 },
      { label: 'Reduced filler words 20%', done: fillerWords.reduce((a, w) => a + w.count, 0) <= 5 },
      { label: 'Next goal: Reach 90 confidence score', done: (metrics.confidence || 0) >= 90 },
    ],
    fillerWords,
  };
}

function buildSessionTitle(report = {}) {
  if (report.type === 'daily') {
    const mode = report.config?.mode || 'day-summary';
    const labelMap = {
      'day-summary': 'Day Summary',
      'topic-practice': 'Topic Practice',
      'ai-conversation': 'AI Conversation',
    };
    return `Daily - ${labelMap[mode] || 'Practice'}`;
  }
  const role = report.config?.role || normalizeRole(report.config?.roleId);
  return `Mock - ${role}`;
}

function topMetric(metrics = {}) {
  return Object.entries(metrics).sort((a, b) => (b[1] || 0) - (a[1] || 0))[0]?.[0] || 'confidence';
}

function lowMetric(metrics = {}) {
  return Object.entries(metrics).sort((a, b) => (a[1] || 0) - (b[1] || 0))[0]?.[0] || 'fluency';
}

function cap(v) {
  return `${String(v || '').charAt(0).toUpperCase()}${String(v || '').slice(1)}`;
}

function avgArray(values = []) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + (Number.isFinite(Number(b)) ? Number(b) : 0), 0) / values.length;
}

function avgNum(source = [], getter) {
  const vals = source
    .map(getter)
    .map(v => Number(v))
    .filter(v => Number.isFinite(v));
  return avgArray(vals);
}

function timeSince(date) {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
}

module.exports = {
  createOrGetLocalUser,
  markUserActivity,
  setUserStreak,
  createInterviewSession,
  addAnswer,
  endSession,
  createReportFromSession,
  createDailyReport,
  getLatestReport,
  getReportsForUser,
  getDashboardSnapshot,
};
