/**
 * Dashboard seed/mock data.
 * Used ONLY as a fallback when the backend is unavailable.
 * Do not import this directly in components — use the `useDashboard` hook.
 */

export const MOCK_DASHBOARD = {
  summary: {
    streak: { current: 14, lastActiveDate: new Date().toISOString() },
    metrics: {
      confidence: 82,
      clarity: 74,
      fluency: 69,
      structure: 58,
      vocabulary: 72,
      overall: 71,
    },
    strengths: [
      { text: 'Clear technical explanations', status: 'Improving' },
      { text: 'Strong conversational confidence', status: 'Stable' },
      { text: 'Natural storytelling energy', status: 'Improving' },
      { text: 'Good speaking consistency', status: 'Stable' },
    ],
    growthAreas: [
      { text: 'Reduce filler words during transitions', tip: 'Try pausing instead of filling silence.' },
      { text: 'Pause slightly before answering', tip: 'A 1-second pause sounds composed.' },
      { text: 'Use stronger descriptive vocabulary', tip: 'Replace generic words with vivid ones.' },
      { text: 'Improve pacing in longer responses', tip: 'Break answers into 2–3 clear sections.' },
    ],
  },

  performance: {
    '7': [
      { label: 'Mon', score: 55 },
      { label: 'Tue', score: 62 },
      { label: 'Wed', score: 65 },
      { label: 'Thu', score: 60 },
      { label: 'Fri', score: 75 },
      { label: 'Sat', score: 84 },
      { label: 'Sun', score: 78 },
    ],
    '30': [
      { label: 'Wk1', score: 50 },
      { label: 'Wk2', score: 58 },
      { label: 'Wk3', score: 67 },
      { label: 'Wk4', score: 76 },
    ],
  },

  sessions: [
    { id: '1', title: 'Mock — Software Eng', type: 'solo', date: 'Yesterday', score: 92, best: 'structure', area: 'pacing', dur: '28m' },
    { id: '2', title: 'Phone Call with AI', type: 'daily', date: '2 days ago', score: 78, best: 'clarity', area: 'fillers', dur: '18m' },
    { id: '3', title: 'Peer Practice', type: 'p2p', date: '4 days ago', score: 85, best: 'confidence', area: 'transitions', dur: '22m' },
  ],

  milestones: [
    { label: 'First AI Call Completed', done: true },
    { label: '7-Day Streak', done: true },
    { label: 'Reduced filler words 20%', done: true },
    { label: 'Next goal: Reach 90 confidence score', done: false },
  ],

  fillerWords: [
    { word: 'uh', count: 4 },
    { word: 'like', count: 3 },
    { word: 'you know', count: 2 },
    { word: 'so', count: 1 },
    { word: 'actually', count: 1 },
  ],
};
