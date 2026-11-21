// Turns metrics (and optional model judgements) into a fluency score that is honest about its limits.
// Every score carries a range and a confidence, never a single falsely precise number.
import { MIN_WORDS_TO_SCORE } from './metrics.js';

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// 0-100 from a value that is best inside [lo, hi] and falls off linearly outside it.
function bandScore(value, lo, hi, falloff) {
  if (value == null) return null;
  if (value >= lo && value <= hi) return 100;
  const distance = value < lo ? lo - value : value - hi;
  return clamp(100 - (distance / falloff) * 100);
}

export function paceScore(wpm) {
  return bandScore(wpm, 120, 160, 80);
}

export function fillerScore(perHundredWords) {
  // 0-2 fillers per 100 words is natural speech. About 12 or more is very distracting.
  return clamp(100 - Math.max(0, perHundredWords - 2) * 10);
}

export function vocabularyScore(mattr) {
  // Typical spoken English sits around 0.6-0.8 over a 50-word window.
  return clamp(((mattr - 0.45) / 0.4) * 100);
}

export function pauseScore(longPauses, wordCount) {
  if (!wordCount) return null;
  return clamp(100 - (longPauses / (wordCount / 100)) * 20);
}

export function bandLabel(score) {
  if (score == null) return 'Not enough speech';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Solid';
  if (score >= 40) return 'Developing';
  return 'Needs practice';
}

/**
 * @param {ReturnType<import('./metrics.js').analyzeSpeech>} m
 * @param {{ structure?: number, relevance?: number }} [judged] 0-100 values from the language model
 */
export function scoreSpeech(m, judged = {}) {
  if (!m.sufficient) {
    return {
      score: null,
      range: null,
      band: bandLabel(null),
      confidence: 'none',
      reason: `Speak for at least ${MIN_WORDS_TO_SCORE} words to get a score. Short clips are too unreliable to rate.`,
      parts: {},
    };
  }

  const parts = {
    pace: paceScore(m.wpm),
    fillers: fillerScore(m.fillers.perHundredWords),
    vocabulary: vocabularyScore(m.vocabulary),
    pauses: pauseScore(m.longPauses, m.wordCount),
    structure: judged.structure ?? null,
    relevance: judged.relevance ?? null,
  };

  // Weights are renormalised over the parts we could actually measure.
  // Fillers carry less weight than you might expect: speech-to-text often drops "um" and "uh",
  // so the count is a floor, not the truth. Pace and pauses come from audio timing and are more reliable.
  const weights = { pace: 0.2, fillers: 0.12, vocabulary: 0.08, pauses: 0.15, structure: 0.3, relevance: 0.15 };
  let total = 0;
  let weightSum = 0;
  for (const [k, w] of Object.entries(weights)) {
    if (parts[k] != null) { total += parts[k] * w; weightSum += w; }
  }
  const score = Math.round(total / weightSum);

  // Uncertainty shrinks with more speech and when a model judgement is included.
  const base = m.wordCount >= 150 ? 6 : m.wordCount >= 80 ? 9 : 13;
  const unverified = judged.structure != null && judged.evidenceVerified === false;
  const margin = judged.structure == null ? base + 4 : unverified ? base + 3 : base;
  let confidence = m.wordCount >= 150 && judged.structure != null ? 'good' : m.wordCount >= 80 ? 'fair' : 'low';
  if (unverified && confidence === 'good') confidence = 'fair';

  return {
    score,
    range: [clamp(score - margin), clamp(score + margin)],
    margin,
    band: bandLabel(score),
    confidence,
    parts,
  };
}
