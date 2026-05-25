const { AI_SERVICE_URL } = require('../config/env');
const AI_ANALYSIS_TIMEOUT_MS = Number(process.env.AI_ANALYSIS_TIMEOUT_MS || 35000);

const DEFAULT_BY_ROUND = {
  hr: [
    'Tell me about a recent project or experience that best represents you for this role.',
    'Describe a time you resolved a conflict with a teammate or stakeholder.',
    'Tell me about a difficult decision you made under pressure.',
    'Share an example of when you took ownership beyond your assigned responsibility.',
    'What is one failure that changed how you work today?',
  ],
  behavioral: [
    'Tell me about a recent project or experience that best represents you for this role.',
    'Describe a time you resolved a conflict with a teammate or stakeholder.',
    'Tell me about a difficult decision you made under pressure.',
    'Share an example of when you took ownership beyond your assigned responsibility.',
    'What is one failure that changed how you work today?',
  ],
  technical: [
    'Walk me through a technically challenging project from your resume.',
    'How did you debug a production issue end-to-end?',
    'How do you design for performance and reliability?',
    'Explain a tradeoff you made in architecture and why.',
    'How do you test critical paths before release?',
  ],
  system_design: [
    'Design a scalable service relevant to your domain experience.',
    'How would you handle spikes in traffic and maintain latency?',
    'What data model and indexing strategy would you choose?',
    'How would you monitor and alert for failure scenarios?',
    'How would you roll out changes safely with minimal downtime?',
  ],
  coding: [
    'Solve a medium difficulty coding problem and explain your approach.',
    'Discuss time and space complexity of your solution.',
    'How would you optimize your first implementation?',
    'How do you test edge cases quickly?',
    'Can you provide an alternative solution and compare tradeoffs?',
  ],
};

const ROUND_LABELS = {
  hr: 'HR / behavioral',
  behavioral: 'behavioral',
  technical: 'technical',
  coding: 'coding',
  system_design: 'system design',
  system: 'system design',
};

function normalizeRound(round = 'hr') {
  const value = String(round || '').trim().toLowerCase();
  if (value === 'system') return 'system_design';
  if (value === 'behavioral') return 'hr';
  return DEFAULT_BY_ROUND[value] ? value : 'hr';
}

function normalizeQuestionKey(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(can|could|would|please|tell|me|about|describe|explain|walk|through|share|an|a|the|your|you|how|what|why)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a = '', b = '') {
  const aw = new Set(normalizeQuestionKey(a).split(' ').filter(Boolean));
  const bw = new Set(normalizeQuestionKey(b).split(' ').filter(Boolean));
  if (!aw.size || !bw.size) return 0;
  const overlap = [...aw].filter((word) => bw.has(word)).length;
  return overlap / Math.max(aw.size, bw.size);
}

function isFreshQuestion(question = '', askedQuestions = []) {
  const key = normalizeQuestionKey(question);
  if (!key) return false;
  return !askedQuestions.some((asked) => {
    const askedKey = normalizeQuestionKey(asked);
    const repeatsFollowUpFrame =
      askedKey.includes('specific decisions') && key.includes('specific decisions') &&
      askedKey.includes('tradeoffs') && key.includes('tradeoffs') &&
      askedKey.includes('measurable outcome') && key.includes('measurable outcome');
    return askedKey === key || similarity(askedKey, key) >= 0.72 || repeatsFollowUpFrame;
  });
}

function uniqueQuestions(values = [], max = 6) {
  const out = [];
  for (const value of values) {
    const question = String(value || '').trim();
    if (!question || !isFreshQuestion(question, out)) continue;
    out.push(question);
    if (out.length >= max) break;
  }
  return out;
}

function uniqueTop(values = [], max = 5) {
  const seen = new Set();
  const out = [];
  for (const v of values) {
    const key = String(v || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(String(v).trim());
    if (out.length >= max) break;
  }
  return out;
}

function summarizeResume(resume = {}) {
  const skills = uniqueTop(resume.skills || [], 6);
  const projects = uniqueTop((resume.projects || []).map(p => p?.name).filter(Boolean), 3);
  const education = resume.education || '';
  const experienceYears = resume.experienceYears || resume.yearsExperience || '';

  const summaryParts = [];
  if (skills.length) summaryParts.push(`skills: ${skills.join(', ')}`);
  if (projects.length) summaryParts.push(`projects: ${projects.join(', ')}`);
  if (education) summaryParts.push(`education: ${education}`);
  if (experienceYears) summaryParts.push(`experience: ${experienceYears} years`);
  return summaryParts.join(' | ');
}

function getPriorityKeywords(config = {}, resume = {}) {
  const raw = Array.isArray(config.priorityKeywords)
    ? config.priorityKeywords
    : String(config.priorityKeywords || '').split(',');
  const fromConfig = raw.map((item) => String(item || '').trim()).filter(Boolean);
  const fromResume = uniqueTop(resume.skills || [], 4);
  return uniqueTop([...fromConfig, ...fromResume], 8);
}

function extractAnswerKeywords(text = '', max = 8) {
  const stopWords = new Set([
    'about', 'after', 'again', 'also', 'because', 'before', 'being', 'could', 'during',
    'from', 'have', 'into', 'just', 'like', 'more', 'most', 'that', 'their', 'there',
    'these', 'they', 'this', 'through', 'were', 'when', 'where', 'which', 'with',
    'would', 'your', 'myself', 'really', 'very', 'then', 'than', 'them', 'some',
  ]);
  const counts = new Map();
  for (const raw of String(text).toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []) {
    const word = raw.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    if (!word || stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word)
    .slice(0, max);
}

async function generateQuestionsFromResume({ config = {}, resume = {} }) {
  const role = config.role || 'the target role';
  const round = normalizeRound(config.interviewRound);
  const roundLabel = ROUND_LABELS[round] || round;
  const context = config.interviewContext || 'General';
  const experience = config.experienceLevel || 'candidate';
  const summary = summarizeResume(resume);
  const variationSeed = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const priorityKeywords = getPriorityKeywords(config, resume);
  const priorityText = priorityKeywords.length ? priorityKeywords.join(', ') : context;

  const skills = uniqueTop(resume.skills || [], 3);
  const projects = uniqueTop((resume.projects || []).map(p => p?.name).filter(Boolean), 2);

  const personalized = [];
  personalized.push(`For this ${roundLabel} ${role} interview, focus on ${priorityText}: tell me about the most relevant experience you want me to evaluate first.`);
  personalized.push(`In the context of ${context}, what is one example from your background that proves your readiness for a ${role} role?`);
  if (skills.length) {
    personalized.push(`From your resume, explain how you used ${skills.join(', ')} to create impact in a real project.`);
    personalized.push(`What was the toughest challenge while applying ${skills[0]} and how did you solve it?`);
  }
  if (projects.length) {
    personalized.push(`Walk me through ${projects[0]} end-to-end, focusing on decisions, your role, and measurable outcomes.`);
  }

  const fallback = DEFAULT_BY_ROUND[round] || DEFAULT_BY_ROUND.behavioral;
  const fallbackPool = [...personalized, ...fallback];

  try {
    const res = await postJson(`${AI_SERVICE_URL}/api/questions`, {
      resume_summary: [
        summary || 'No resume summary available.',
        `Priority focus keywords: ${priorityKeywords.join(', ') || 'none provided'}.`,
        `Experience level: ${experience}.`,
      ].join('\n'),
      role,
      interview_round: roundLabel,
      context: [
        `Selected interview context: ${context}.`,
        `Prioritize the user's selected role, interview type, experience level, and priority focus before generic resume questions.`,
        `Generate distinct questions. Do not ask multiple variants of the same prompt.`,
      ].join(' '),
      variation_seed: variationSeed,
    });

    if (res.ok) {
      const payload = await res.json();
      const questions = (payload.questions || [])
        .map((item) => item?.question || item)
        .filter(Boolean);
      if (questions.length > 0) {
        const padded = questions.length >= 5
          ? questions
          : [...questions, ...fallbackPool];
        return uniqueQuestions([...personalized, ...padded], 6);
      }
    }
  } catch (err) {
    // fall back below
  }
  return uniqueQuestions(fallbackPool, 6);
}

async function postJson(url, payload, timeoutMs = AI_ANALYSIS_TIMEOUT_MS) {
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

async function generateFollowUpQuestion({
  config = {},
  resume = {},
  previousQuestion = '',
  answerText = '',
  analysis = null,
  askedQuestions = [],
}) {
  const role = config.role || 'the target role';
  const round = normalizeRound(config.interviewRound);
  const roundLabel = ROUND_LABELS[round] || round;
  const contextLabel = config.interviewContext || 'General';
  const priorityKeywords = getPriorityKeywords(config, resume);
  const keywords = uniqueTop([...extractAnswerKeywords(answerText, 8), ...priorityKeywords], 10);
  const strengths = (analysis?.feedback?.strengths || []).slice(0, 2).join('; ');
  const improvements = (analysis?.feedback?.improvements || []).slice(0, 2).join('; ');
  const resumeSummary = summarizeResume(resume);
  const asked = uniqueQuestions(askedQuestions, 12);
  const keywordText = keywords.length ? keywords.join(', ') : 'the candidate answer';
  const context = [
    `Generate the next interview question as a natural follow-up to the candidate's last answer.`,
    `Role: ${role}. Round: ${roundLabel}. Context: ${contextLabel}.`,
    `Previous question: ${previousQuestion || 'N/A'}`,
    `Candidate answer keywords: ${keywordText}.`,
    priorityKeywords.length ? `User-prioritized topics: ${priorityKeywords.join(', ')}.` : '',
    strengths ? `Observed strengths: ${strengths}.` : '',
    improvements ? `Probe these gaps: ${improvements}.` : '',
    asked.length ? `Do not repeat these asked questions: ${asked.join(' | ')}` : '',
    `The next question must reference at least one candidate-answer keyword and ask for deeper evidence, tradeoffs, metrics, failure handling, or lessons learned.`,
  ].filter(Boolean).join('\n');

  try {
    const res = await postJson(`${AI_SERVICE_URL}/api/questions`, {
      resume_summary: `${resumeSummary || 'No resume summary available.'}\nLast answer: ${String(answerText).slice(0, 900)}`,
      role,
      interview_round: roundLabel,
      context,
      variation_seed: `${Date.now()}-${keywords.join('-')}`,
    });

    if (res.ok) {
      const payload = await res.json();
      const questions = (payload.questions || [])
        .map((item) => item?.question || item)
        .filter(Boolean);
      const fresh = questions.find(q => isFreshQuestion(q, asked));
      if (fresh) return fresh;
    }
  } catch {
    // fall back below
  }

  const fallbackQuestions = [
    `You mentioned ${keywordText}. Can you walk me through the specific decisions you made, the tradeoffs involved, and the measurable outcome?`,
    `Earlier you brought up ${keywords[0] || contextLabel}. What was the hardest constraint, and how did you handle it?`,
    `Based on your answer, what would you improve if you had to solve the same problem again in a ${role} role?`,
    `Can you give one concrete metric or signal that proves your work on ${keywords[0] || contextLabel} succeeded?`,
  ];
  return fallbackQuestions.find((candidate) => isFreshQuestion(candidate, asked))
    || `Let us go deeper on ${keywords[keywords.length - 1] || contextLabel}: what tradeoff did you make, and what did you learn?`;
}

function shuffle(values = []) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function analyzeAnswer({ transcript, question, config }) {
  const payload = {
    transcript,
    context: `${config?.role || 'Interview'} | ${config?.interviewRound || 'behavioral'} | ${config?.interviewContext || 'General'} | Q: ${question}`,
    session_type: 'solo',
  };
  try {
    const analysis = await fetchWithRetry(`${AI_SERVICE_URL}/api/analyze`, payload, 1);
    analysis.answerKeywords = extractAnswerKeywords(transcript, 8);
    return analysis;
  } catch (err) {
    const fallback = buildLocalAnswerAnalysis({ transcript, question, config });
    fallback.fallback = true;
    fallback.error = err.message;
    return fallback;
  }
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getWords(text = '') {
  return String(text).toLowerCase().match(/[a-z][a-z0-9']*/g) || [];
}

function countSentences(text = '') {
  const matches = String(text).trim().match(/[.!?]+/g);
  return Math.max(1, matches?.length || 1);
}

function buildLocalAnswerAnalysis({ transcript = '', question = '', config = {} }) {
  const cleaned = String(transcript || '').trim();
  const words = getWords(cleaned);
  const wordCount = words.length;
  const uniqueCount = new Set(words).size;
  const sentenceCount = countSentences(cleaned);
  const avgSentenceLength = wordCount / sentenceCount;
  const estimatedDurationSeconds = Math.max(8, Math.round((wordCount / 140) * 60));
  const wordsPerMinute = wordCount / Math.max(estimatedDurationSeconds / 60, 0.1);
  const uniqueWordRatio = wordCount ? uniqueCount / wordCount : 0;

  const fillerSet = new Set(['um', 'uh', 'like', 'actually', 'basically', 'literally', 'just', 'maybe', 'kind', 'sort']);
  const hedgeSet = new Set(['maybe', 'probably', 'guess', 'think', 'perhaps']);
  const actionSet = new Set(['led', 'built', 'created', 'improved', 'delivered', 'owned', 'designed', 'solved', 'measured', 'launched']);
  const resultSet = new Set(['increased', 'reduced', 'improved', 'saved', 'grew', 'faster', 'revenue', 'users', 'percent', 'impact']);
  const fillerCounts = new Map();
  for (const word of words) {
    if (fillerSet.has(word)) fillerCounts.set(word, (fillerCounts.get(word) || 0) + 1);
  }
  const fillerTotal = [...fillerCounts.values()].reduce((sum, n) => sum + n, 0);
  const hedgeTotal = words.filter((word) => hedgeSet.has(word)).length;
  const actionHits = words.filter((word) => actionSet.has(word)).length;
  const resultHits = words.filter((word) => resultSet.has(word) || /\d/.test(word)).length;
  const completeEnding = /[.!?]$/.test(cleaned);
  const clarityScore = clampScore(
    35 +
    Math.min(wordCount, 90) * 0.32 +
    uniqueWordRatio * 20 +
    (avgSentenceLength >= 8 && avgSentenceLength <= 28 ? 18 : 8) +
    (completeEnding ? 8 : 2) -
    fillerTotal * 4
  );
  const confidenceScore = clampScore(
    36 +
    Math.min(wordCount, 85) * 0.35 +
    Math.min(actionHits, 4) * 8 +
    (completeEnding ? 6 : 2) -
    hedgeTotal * 5 -
    fillerTotal * 2
  );
  const fillerScore = clampScore(100 - (wordCount ? (fillerTotal / wordCount) * 500 : 0));
  const vocabularyScore = clampScore(45 + uniqueWordRatio * 42 + Math.min(actionHits + resultHits, 6) * 3);
  const starScore = clampScore(
    35 +
    Math.min(actionHits, 4) * 10 +
    Math.min(resultHits, 4) * 9 +
    (wordCount >= 60 ? 12 : wordCount >= 30 ? 7 : 2)
  );
  const overallScore = clampScore(
    clarityScore * 0.22 +
    confidenceScore * 0.22 +
    fillerScore * 0.14 +
    vocabularyScore * 0.16 +
    starScore * 0.26
  );

  const strengths = [];
  if (actionHits) strengths.push('You used action-oriented language to describe your contribution.');
  if (resultHits) strengths.push('You included outcome signals that make the answer easier to evaluate.');
  if (wordCount >= 45) strengths.push('Your response had enough detail for meaningful assessment.');
  if (!strengths.length) strengths.push('You gave a concise answer and stayed on the interview question.');

  const improvements = [];
  if (starScore < 70) improvements.push('Add clearer Situation, Task, Action, and Result beats.');
  if (resultHits < 1) improvements.push('Include one measurable outcome or business impact.');
  if (fillerTotal > 2) improvements.push('Pause briefly instead of using filler words.');
  if (wordCount < 35) improvements.push('Expand the answer with a concrete example.');
  if (!improvements.length) improvements.push('Tighten the ending by summarizing the lesson learned.');

  const detected = [...fillerCounts.entries()].map(([word, count]) => ({
    word,
    count,
    percentage: wordCount ? Number(((count / wordCount) * 100).toFixed(2)) : 0,
  }));

  return {
    success: true,
    answerKeywords: extractAnswerKeywords(cleaned, 8),
    scores: {
      clarity_score: clarityScore,
      confidence_score: confidenceScore,
      filler_score: fillerScore,
      vocabulary_score: vocabularyScore,
      star_score: starScore,
      overall_score: overallScore,
    },
    feedback: {
      strengths,
      improvements,
      actionable_tip: improvements[0] || 'Keep answers structured and connect your actions to measurable outcomes.',
    },
    analysis: {
      clarity: `Answered for ${config?.role || 'the role'} with ${wordCount} words.`,
      confidence: confidenceScore >= 70 ? 'Confident delivery signals were present.' : 'Confidence can improve with stronger ownership verbs.',
      coherence: question ? 'The answer was evaluated against the current interview question.' : 'The answer was evaluated without a question prompt.',
      vocabulary_richness: vocabularyScore >= 70 ? 'Good vocabulary variety.' : 'Use more specific technical or impact-oriented terms.',
      sentence_completion: completeEnding ? 'The response ended cleanly.' : 'The response may have ended abruptly.',
      speaking_pace: `Estimated pace is ${Math.round(wordsPerMinute)} words per minute.`,
      communication_quality: overallScore >= 75 ? 'Strong overall communication.' : 'Good foundation with room to improve structure and impact.',
      star_structure: {
        situation: clampScore(starScore - 8),
        task: clampScore(starScore - 4),
        action: clampScore(starScore + Math.min(actionHits, 3) * 3),
        result: clampScore(starScore + Math.min(resultHits, 3) * 3 - 6),
        overall: starScore,
        feedback: starScore >= 70 ? 'STAR elements are reasonably clear.' : 'Make each STAR element explicit and end with a measurable result.',
      },
      filler_words: {
        total_count: fillerTotal,
        total_percentage: wordCount ? Number(((fillerTotal / wordCount) * 100).toFixed(2)) : 0,
        detected,
      },
    },
    metrics: {
      word_count: wordCount,
      sentence_count: sentenceCount,
      avg_sentence_length: Number(avgSentenceLength.toFixed(2)),
      estimated_duration_seconds: estimatedDurationSeconds,
      words_per_minute: Number(wordsPerMinute.toFixed(2)),
      unique_word_ratio: Number(uniqueWordRatio.toFixed(3)),
    },
  };
}

async function fetchWithRetry(url, payload, retries = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_ANALYSIS_TIMEOUT_MS);
  let res;

  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return fetchWithRetry(url, payload, retries - 1);
    }
    const text = await res.text();
    throw new Error(`AI service error (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

module.exports = {
  generateQuestionsFromResume,
  generateFollowUpQuestion,
  analyzeAnswer,
};
