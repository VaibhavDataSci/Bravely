const { AI_SERVICE_URL } = require('../config/env');

const DAILY_AI_TIMEOUT_MS = Number(process.env.DAILY_AI_TIMEOUT_MS || 35000);

const FALLBACK_TOPICS = [
  {
    category: 'Leadership & Strategy',
    prompt: 'Describe a time you had to pivot your strategy quickly.',
    guidance: 'Use STAR: set the context, name the pressure, explain your decision, then close with impact.',
  },
  {
    category: 'Collaboration',
    prompt: 'Tell me about a conversation where you had to disagree respectfully.',
    guidance: 'Focus on tone, evidence, listening, and how the relationship changed after the conversation.',
  },
  {
    category: 'Executive Presence',
    prompt: 'Explain a complex idea from your work as if you were briefing a senior leader.',
    guidance: 'Lead with the headline, give only the necessary context, and end with the decision needed.',
  },
];

const CONVERSATION_OPENERS = [
  'Hi, I am Bravely. What is one conversation you want to handle more confidently this week?',
  'Let us warm up. Tell me about something you worked on recently, and I will ask a follow-up.',
  'Imagine we are on a professional check-in call. What is one update you would share first?',
];

function pickFallback(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getWords(text = '') {
  return String(text).toLowerCase().match(/[a-z][a-z0-9']*/g) || [];
}

function extractKeywords(text = '', max = 5) {
  const stopWords = new Set([
    'about', 'after', 'again', 'also', 'because', 'before', 'being', 'could', 'during',
    'from', 'have', 'into', 'just', 'like', 'more', 'most', 'that', 'their', 'there',
    'these', 'they', 'this', 'through', 'were', 'when', 'where', 'which', 'with',
    'would', 'your', 'really', 'very', 'then', 'than', 'them', 'some', 'what',
  ]);
  const counts = new Map();
  for (const word of getWords(text)) {
    if (word.length < 3 || stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word)
    .slice(0, max);
}

async function postJson(url, payload, timeoutMs = DAILY_AI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function generateDailyTopic() {
  try {
    const res = await postJson(`${AI_SERVICE_URL}/api/questions`, {
      resume_summary: 'Daily communication practice user. No resume is required for this exercise.',
      role: 'Professional communicator',
      interview_round: 'daily speaking practice',
      context: [
        'Generate five fresh daily speaking challenge prompts.',
        'Each prompt should be useful for a 2-minute spoken response.',
        'Prefer workplace communication, confidence, clarity, leadership, conflict, or storytelling scenarios.',
      ].join(' '),
      variation_seed: `daily-topic-${new Date().toISOString().slice(0, 10)}-${Date.now()}`,
    });

    if (res.ok) {
      const payload = await res.json();
      const first = (payload.questions || []).map((item) => item?.question || item).find(Boolean);
      if (first) {
        return {
          source: 'ai',
          category: inferTopicCategory(first),
          prompt: first,
          guidance: 'Answer naturally, then make the Situation, Task, Action, and Result easy to hear.',
        };
      }
    }
  } catch {
    // local fallback below
  }

  return { source: 'fallback', ...pickFallback(FALLBACK_TOPICS) };
}

function inferTopicCategory(prompt = '') {
  const text = prompt.toLowerCase();
  if (text.includes('conflict') || text.includes('disagree')) return 'Collaboration';
  if (text.includes('strategy') || text.includes('decision') || text.includes('leader')) return 'Leadership & Strategy';
  if (text.includes('explain') || text.includes('brief')) return 'Executive Presence';
  return 'Daily Challenge';
}

async function analyzeDailyTranscript({
  transcript = '',
  mode = 'day-summary',
  prompt = '',
  duration,
}) {
  const cleaned = String(transcript || '').trim();
  if (!cleaned) {
    return {
      source: 'fallback',
      success: true,
      empty: true,
      transcript: '',
      scores: fallbackScores(0, 0, 0),
      feedback: {
        strengths: ['You opened the practice session.'],
        improvements: ['Record at least a few complete sentences so the AI can evaluate your delivery.'],
        actionable_tip: 'Try a 30-second answer with one clear example.',
      },
      analysis: fallbackAnalysis({ transcript: '', mode, prompt }),
      metrics: fallbackMetrics('', duration),
    };
  }

  try {
    const payload = {
      transcript: cleaned,
      context: `${mode} daily practice${prompt ? ` | Prompt: ${prompt}` : ''}`,
      session_type: 'daily',
      duration,
    };
    const res = await postJson(`${AI_SERVICE_URL}/api/analyze`, payload);
    if (res.ok) {
      const analysis = await res.json();
      return {
        source: 'ai',
        transcript: cleaned,
        ...analysis,
      };
    }
  } catch {
    // local fallback below
  }

  return {
    source: 'fallback',
    success: true,
    transcript: cleaned,
    ...buildFallbackAnalysis({ transcript: cleaned, mode, prompt, duration }),
  };
}

async function generateConversationTurn({
  message = '',
  history = [],
}) {
  const cleaned = String(message || '').trim();
  const lastTurns = history
    .slice(-6)
    .map((turn) => `${turn.role === 'ai' ? 'AI coach' : 'User'}: ${turn.text}`)
    .join('\n');
  const starterPrompt = cleaned || 'Start this daily conversation with a warm opening question.';

  try {
    const res = await postJson(`${AI_SERVICE_URL}/api/questions`, {
      resume_summary: `Conversation so far:\n${lastTurns || 'New daily conversation call.'}\nLatest user message: ${starterPrompt}`,
      role: 'Daily conversation coach',
      interview_round: 'real-time conversation practice',
      context: [
        'Generate five possible next AI replies, phrased as natural spoken follow-up questions.',
        'Keep each under 22 words.',
        'Be warm and specific. Ask one question only. Do not evaluate yet.',
      ].join(' '),
      variation_seed: `daily-chat-${Date.now()}`,
    });

    if (res.ok) {
      const payload = await res.json();
      const reply = (payload.questions || []).map((item) => item?.question || item).find(Boolean);
      if (reply) return { source: 'ai', aiResponse: reply };
    }
  } catch {
    // local fallback below
  }

  const keywords = extractKeywords(cleaned, 3);
  const focus = keywords[0] || 'that';
  return {
    source: 'fallback',
    aiResponse: cleaned
      ? `You mentioned ${focus}. What made that moment difficult, and what did you do next?`
      : pickFallback(CONVERSATION_OPENERS),
  };
}

function buildFallbackAnalysis({ transcript, mode, prompt, duration }) {
  const words = getWords(transcript);
  const wordCount = words.length;
  const uniqueCount = new Set(words).size;
  const sentenceCount = Math.max(1, (String(transcript).match(/[.!?]+/g) || []).length);
  const fillerSet = new Set(['um', 'uh', 'like', 'actually', 'basically', 'literally', 'just']);
  const actionSet = new Set(['led', 'built', 'created', 'improved', 'delivered', 'owned', 'decided', 'solved']);
  const resultSet = new Set(['increased', 'reduced', 'saved', 'grew', 'faster', 'impact', 'result', 'outcome', 'percent']);
  const fillerCounts = new Map();

  for (const word of words) {
    if (fillerSet.has(word)) fillerCounts.set(word, (fillerCounts.get(word) || 0) + 1);
  }

  const fillerTotal = [...fillerCounts.values()].reduce((sum, n) => sum + n, 0);
  const actionHits = words.filter((word) => actionSet.has(word)).length;
  const resultHits = words.filter((word) => resultSet.has(word) || /\d/.test(word)).length;
  const uniqueRatio = wordCount ? uniqueCount / wordCount : 0;
  const starScore = clampScore(35 + Math.min(actionHits, 4) * 10 + Math.min(resultHits, 4) * 10 + Math.min(wordCount, 80) * 0.2);
  const clarityScore = clampScore(42 + Math.min(wordCount, 90) * 0.28 + uniqueRatio * 24 - fillerTotal * 3);
  const confidenceScore = clampScore(40 + Math.min(actionHits, 5) * 7 + Math.min(wordCount, 80) * 0.22 - fillerTotal * 2);
  const vocabularyScore = clampScore(45 + uniqueRatio * 42 + Math.min(actionHits + resultHits, 5) * 3);
  const fillerScore = clampScore(100 - (wordCount ? (fillerTotal / wordCount) * 550 : 0));

  return {
    scores: fallbackScores(clarityScore, confidenceScore, fillerScore, vocabularyScore, starScore),
    feedback: {
      strengths: [
        wordCount >= 35 ? 'You gave enough detail for meaningful feedback.' : 'You kept the response concise.',
        actionHits ? 'You used action-oriented language.' : 'You stayed focused on the prompt.',
        resultHits ? 'You included an outcome signal.' : 'Your response has a clear starting point.',
      ],
      improvements: [
        starScore < 70 ? 'Make the STAR structure more explicit.' : 'Tighten the transition between context and action.',
        resultHits < 1 ? 'Add one measurable result or observable impact.' : 'End with a short lesson learned.',
        fillerTotal > 1 ? 'Replace filler words with a short pause.' : 'Vary sentence length to sound more natural.',
      ],
      actionable_tip: mode === 'topic-practice'
        ? 'Close your answer with: "As a result..." and one concrete outcome.'
        : 'Summarize your main point in one final sentence before stopping.',
    },
    analysis: fallbackAnalysis({ transcript, mode, prompt, starScore, fillerCounts }),
    metrics: fallbackMetrics(transcript, duration),
  };
}

function fallbackScores(clarity = 0, confidence = 0, filler = 0, vocabulary = 0, star = 0) {
  const overall = clampScore(clarity * 0.24 + confidence * 0.22 + filler * 0.14 + vocabulary * 0.16 + star * 0.24);
  return {
    clarity_score: clampScore(clarity),
    confidence_score: clampScore(confidence),
    filler_score: clampScore(filler),
    vocabulary_score: clampScore(vocabulary),
    star_score: clampScore(star),
    overall_score: overall,
  };
}

function fallbackAnalysis({ transcript = '', mode = 'day-summary', prompt = '', starScore = 50, fillerCounts = new Map() }) {
  const wordCount = getWords(transcript).length;
  const fillerTotal = [...fillerCounts.values()].reduce((sum, n) => sum + n, 0);
  const detected = [...fillerCounts.entries()].map(([word, count]) => ({
    word,
    count,
    percentage: wordCount ? Number(((count / wordCount) * 100).toFixed(2)) : 0,
  }));

  return {
    clarity: wordCount ? `Your ${mode} response contained ${wordCount} words and stayed connected to the exercise.` : 'No spoken transcript was available.',
    confidence: 'Confidence is estimated from length, ownership verbs, and filler usage.',
    coherence: prompt ? `The response was evaluated against: ${prompt}` : 'The response was evaluated as open daily speaking practice.',
    vocabulary_richness: 'Vocabulary variety is estimated locally while the AI service is offline.',
    sentence_completion: /[.!?]$/.test(String(transcript).trim()) ? 'The response ended cleanly.' : 'The response may have ended abruptly.',
    speaking_pace: 'Speaking pace is estimated from transcript length and recorded duration.',
    communication_quality: 'Local fallback analysis is active; reconnect AI for deeper coaching.',
    star_structure: {
      situation: clampScore(starScore - 8),
      task: clampScore(starScore - 4),
      action: clampScore(starScore + 4),
      result: clampScore(starScore - 10),
      overall: clampScore(starScore),
      feedback: 'Make the situation, action, and result easy to identify.',
    },
    filler_words: {
      total_count: fillerTotal,
      total_percentage: wordCount ? Number(((fillerTotal / wordCount) * 100).toFixed(2)) : 0,
      detected,
    },
  };
}

function fallbackMetrics(transcript = '', duration) {
  const words = getWords(transcript);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, (String(transcript).match(/[.!?]+/g) || []).length);
  const estimatedDurationSeconds = Number(duration) || Math.max(8, Math.round((wordCount / 140) * 60));
  const wordsPerMinute = wordCount / Math.max(estimatedDurationSeconds / 60, 0.1);
  return {
    word_count: wordCount,
    sentence_count: sentenceCount,
    avg_sentence_length: Number((wordCount / sentenceCount).toFixed(2)),
    estimated_duration_seconds: estimatedDurationSeconds,
    words_per_minute: Number(wordsPerMinute.toFixed(2)),
    unique_word_ratio: wordCount ? Number((new Set(words).size / wordCount).toFixed(3)) : 0,
  };
}

module.exports = {
  analyzeDailyTranscript,
  generateConversationTurn,
  generateDailyTopic,
};
