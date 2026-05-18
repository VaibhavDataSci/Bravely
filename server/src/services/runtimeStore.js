const crypto = require('crypto');

const state = {
  usersByEmail: new Map(),
  sessions: new Map(),
  reports: [],
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

function createOrGetLocalUser({ email, name }) {
  const key = String(email || '').trim().toLowerCase();
  if (!key) return null;

  if (!state.usersByEmail.has(key)) {
    state.usersByEmail.set(key, {
      id: `local_${key.replace(/[^a-z0-9]/g, '_')}`,
      email: key,
      name: name || key.split('@')[0],
      role: 'user',
      streak: { current: 1, lastActiveDate: new Date().toISOString() },
      preferences: { theme: 'dark' },
      createdAt: new Date().toISOString(),
    });
  }

  const existing = state.usersByEmail.get(key);
  if (name && !existing.name) existing.name = name;
  return existing;
}

function createInterviewSession({ userId, config, resume, questions }) {
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
  return session;
}

function endSession({ sessionId }) {
  const session = state.sessions.get(sessionId);
  if (!session) return null;
  session.status = 'completed';
  session.endedAt = new Date().toISOString();
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

function getLatestReport(userId) {
  return state.reports.find(r => r.userId === userId) || null;
}

function getReportsForUser(userId, limit = 50) {
  return state.reports.filter(r => r.userId === userId).slice(0, limit);
}

function getDashboardSnapshot(userId, range = 7) {
  const reports = getReportsForUser(userId, 100);
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

  const sessions = getReportsForUser(userId, 5).map((r, idx) => ({
    id: r.id,
    sessionId: r.sessionId,
    title: buildSessionTitle(r.config),
    type: r.type || 'solo',
    date: timeSince(r.createdAt),
    score: Math.round(r.overallScore || 0),
    best: topMetric(r.metrics),
    area: lowMetric(r.metrics),
    dur: `${Math.max(1, (idx + 1) * 3)}m`,
    verdict: r.verdict,
  }));

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
    streak: { current: Math.min(30, Math.max(1, reports.length)), lastActiveDate: reports[0]?.createdAt || null },
    metrics,
    strengths,
    growthAreas,
    points,
    sessions,
    milestones: [
      { label: 'First AI Call Completed', done: reports.length >= 1 },
      { label: '7-Day Streak', done: reports.length >= 7 },
      { label: 'Reduced filler words 20%', done: fillerWords.reduce((a, w) => a + w.count, 0) <= 5 },
      { label: 'Next goal: Reach 90 confidence score', done: (metrics.confidence || 0) >= 90 },
    ],
    fillerWords,
  };
}

function buildSessionTitle(config) {
  const role = config?.role || normalizeRole(config?.roleId);
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
  createInterviewSession,
  addAnswer,
  endSession,
  createReportFromSession,
  getLatestReport,
  getReportsForUser,
  getDashboardSnapshot,
};
