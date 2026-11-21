// Objective speech metrics computed in code, not by an LLM. They are repeatable, instant and
// free, so the model is only asked for judgements code cannot make (structure, relevance).

// Hesitation sounds: almost never part of real content.
const HARD_FILLERS = ['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'ah', 'hmm', 'mm'];
// Phrases that are usually filler. Matched as whole phrases.
const FILLER_PHRASES = ['you know', 'i mean', 'sort of', 'kind of', 'you see'];
// Real words that are often used as filler. Reported separately and never counted as errors,
// because "actually" or "basically" can be legitimate.
const SOFT_FILLERS = ['basically', 'literally', 'actually', 'honestly', 'like'];

export const MIN_WORDS_TO_SCORE = 40;
export const TARGET_WPM = [120, 160];

export function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countPhrase(tokens, phrase) {
  const parts = phrase.split(' ');
  let n = 0;
  for (let i = 0; i <= tokens.length - parts.length; i += 1) {
    if (parts.every((p, j) => tokens[i + j] === p)) n += 1;
  }
  return n;
}

export function countFillers(tokens) {
  const hard = tokens.filter((t) => HARD_FILLERS.includes(t)).length;
  const phrases = FILLER_PHRASES.reduce((sum, p) => sum + countPhrase(tokens, p), 0);
  const soft = tokens.filter((t) => SOFT_FILLERS.includes(t)).length;
  return { hard, phrases, soft, counted: hard + phrases };
}

// Moving-average type-token ratio: unlike plain TTR it does not fall just because the answer is longer.
export function vocabularyRichness(tokens, window = 50) {
  if (tokens.length === 0) return 0;
  if (tokens.length <= window) return new Set(tokens).size / tokens.length;
  let total = 0;
  let windows = 0;
  for (let i = 0; i + window <= tokens.length; i += 5) {
    total += new Set(tokens.slice(i, i + window)).size / window;
    windows += 1;
  }
  return total / windows;
}

export function paceBand(wpm) {
  if (!wpm) return 'unknown';
  if (wpm < TARGET_WPM[0] - 25) return 'slow';
  if (wpm < TARGET_WPM[0]) return 'slightly slow';
  if (wpm <= TARGET_WPM[1]) return 'steady';
  if (wpm <= TARGET_WPM[1] + 25) return 'slightly fast';
  return 'fast';
}

/**
 * @param {string} transcript
 * @param {{durationSec?: number, words?: {word: string, start: number, end: number}[]}} [options]
 *   `words` are word timestamps from speech-to-text. They give a far better pace and pause estimate
 *   than the total recording length, which includes silence before and after speaking.
 */
export function analyzeSpeech(transcript, { durationSec, words } = {}) {
  const tokens = tokenize(transcript);
  const wordCount = tokens.length;
  const fillers = countFillers(tokens);

  let spokenSec = durationSec || 0;
  let longPauses = 0;
  if (Array.isArray(words) && words.length > 1) {
    spokenSec = words[words.length - 1].end - words[0].start;
    for (let i = 1; i < words.length; i += 1) {
      if (words[i].start - words[i - 1].end >= 1.5) longPauses += 1;
    }
  }

  const wpm = spokenSec > 0 ? Math.round((wordCount / spokenSec) * 60) : null;
  const sentences = (transcript || '').split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  return {
    sufficient: wordCount >= MIN_WORDS_TO_SCORE,
    wordCount,
    durationSec: spokenSec ? Math.round(spokenSec) : null,
    wpm,
    pace: paceBand(wpm),
    // Speech-to-text tends to drop hesitations, so treat this as a minimum, not an exact count.
    fillers: { ...fillers, perHundredWords: wordCount ? +((fillers.counted / wordCount) * 100).toFixed(1) : 0, likelyUndercounted: true },
    longPauses,
    vocabulary: +vocabularyRichness(tokens).toFixed(2),
    avgSentenceWords: sentences.length ? Math.round(wordCount / sentences.length) : 0,
  };
}
