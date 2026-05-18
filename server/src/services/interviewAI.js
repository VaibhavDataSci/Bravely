const { AI_SERVICE_URL } = require('../config/env');

const DEFAULT_BY_ROUND = {
  behavioral: [
    'Tell me about yourself and your recent projects.',
    'Describe a time you resolved a conflict in your team.',
    'Tell me about a difficult decision you made under pressure.',
    'Share an example of when you took ownership beyond your role.',
    'What is one failure that changed how you work today?',
  ],
  technical: [
    'Walk me through a technically challenging project from your resume.',
    'How did you debug a production issue end-to-end?',
    'How do you design for performance and reliability?',
    'Explain a tradeoff you made in architecture and why.',
    'How do you test critical paths before release?',
  ],
  system: [
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
  const round = config.interviewRound || 'behavioral';
  const context = config.interviewContext || 'General';
  const summary = summarizeResume(resume);
  const variationSeed = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  const skills = uniqueTop(resume.skills || [], 3);
  const projects = uniqueTop((resume.projects || []).map(p => p?.name).filter(Boolean), 2);

  const personalized = [];
  if (skills.length) {
    personalized.push(`From your resume (${summary}), explain how you used ${skills.join(', ')} to create impact in a real project.`);
    personalized.push(`What was the toughest challenge while applying ${skills[0]} and how did you solve it?`);
  }
  if (projects.length) {
    personalized.push(`Walk me through ${projects[0]} end-to-end, focusing on decisions, your role, and measurable outcomes.`);
  }
  personalized.push(`For a ${role} interview in ${context}, what is one high-impact result from your resume that you are most proud of?`);

  const fallback = DEFAULT_BY_ROUND[round] || DEFAULT_BY_ROUND.behavioral;
  const fallbackPool = [...personalized, ...fallback];

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_summary: summary,
        role,
        interview_round: round,
        context,
        variation_seed: variationSeed,
      }),
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
        return uniqueTop(shuffle(padded), 6);
      }
    }
  } catch (err) {
    // fall back below
  }
  return uniqueTop(shuffle(fallbackPool), 6);
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
  const round = config.interviewRound || 'behavioral';
  const keywords = extractAnswerKeywords(answerText, 8);
  const strengths = (analysis?.feedback?.strengths || []).slice(0, 2).join('; ');
  const improvements = (analysis?.feedback?.improvements || []).slice(0, 2).join('; ');
  const resumeSummary = summarizeResume(resume);
  const asked = uniqueTop(askedQuestions, 8);
  const keywordText = keywords.length ? keywords.join(', ') : 'the candidate answer';
  const context = [
    `Generate the next interview question as a natural follow-up to the candidate's last answer.`,
    `Role: ${role}. Round: ${round}.`,
    `Previous question: ${previousQuestion || 'N/A'}`,
    `Candidate answer keywords: ${keywordText}.`,
    strengths ? `Observed strengths: ${strengths}.` : '',
    improvements ? `Probe these gaps: ${improvements}.` : '',
    asked.length ? `Do not repeat these asked questions: ${asked.join(' | ')}` : '',
    `The next question must reference at least one answer keyword and ask for deeper evidence, tradeoffs, metrics, or lessons learned.`,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_summary: `${resumeSummary || 'No resume summary available.'}\nLast answer: ${String(answerText).slice(0, 900)}`,
        role,
        interview_round: round,
        context,
        variation_seed: `${Date.now()}-${keywords.join('-')}`,
      }),
    });

    if (res.ok) {
      const payload = await res.json();
      const questions = (payload.questions || [])
        .map((item) => item?.question || item)
        .filter(Boolean);
      const fresh = questions.find(q => !asked.some(a => a.trim().toLowerCase() === q.trim().toLowerCase()));
      if (fresh) return fresh;
    }
  } catch {
    // fall back below
  }

  return `You mentioned ${keywordText}. Can you walk me through the specific decisions you made, the tradeoffs involved, and the measurable outcome?`;
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
  return fetchWithRetry(`${AI_SERVICE_URL}/api/analyze`, payload, 1);
}

async function fetchWithRetry(url, payload, retries = 0) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

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
