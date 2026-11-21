import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSpeech, countFillers, tokenize, vocabularyRichness, paceBand } from '../src/ai/metrics.js';
import { scoreSpeech, fillerScore, paceScore } from '../src/ai/scoring.js';

const words = (n, w = 'word') => Array.from({ length: n }, (_, i) => `${w}${i}`).join(' ');

test('tokenize lowercases and strips punctuation but keeps apostrophes', () => {
  assert.deepEqual(tokenize("Hello, it's ME!"), ['hello', "it's", 'me']);
});

test('countFillers counts hesitations and phrases, reports soft fillers separately', () => {
  const t = tokenize('Um so you know I basically sort of like went there, uh yes');
  const f = countFillers(t);
  assert.equal(f.hard, 2);       // um, uh
  assert.equal(f.phrases, 2);    // you know, sort of
  assert.equal(f.counted, 4);
  assert.equal(f.soft, 2);       // basically, like (never penalised)
});

test('a phrase is not counted when its words are not adjacent', () => {
  assert.equal(countFillers(tokenize('you really know sort and of')).phrases, 0);
});

test('short speech is not scored', () => {
  const m = analyzeSpeech('I went to the market today.', { durationSec: 5 });
  const s = scoreSpeech(m);
  assert.equal(m.sufficient, false);
  assert.equal(s.score, null);
  assert.equal(s.confidence, 'none');
});

test('pace uses word timestamps, so leading and trailing silence does not distort it', () => {
  const text = words(100);
  const timed = Array.from({ length: 100 }, (_, i) => ({ word: `w${i}`, start: 10 + i * 0.4, end: 10.3 + i * 0.4 }));
  const m = analyzeSpeech(text, { durationSec: 90, words: timed });
  assert.equal(m.wpm, 150); // 100 words in ~39.9 s
  assert.equal(m.pace, 'steady');
});

test('long pauses of 1.5 s or more are counted', () => {
  const timed = [
    { word: 'a', start: 0, end: 0.4 }, { word: 'b', start: 0.5, end: 0.9 },
    { word: 'c', start: 3.0, end: 3.4 }, { word: 'd', start: 3.5, end: 3.9 },
  ];
  assert.equal(analyzeSpeech('a b c d', { words: timed }).longPauses, 1);
});

test('vocabularyRichness does not collapse as speech gets longer', () => {
  const varied = Array.from({ length: 400 }, (_, i) => `w${i % 120}`);
  assert.ok(vocabularyRichness(varied) > 0.9);
});

test('paceBand and pace score follow the 120-160 wpm target', () => {
  assert.equal(paceBand(140), 'steady');
  assert.equal(paceBand(100), 'slightly slow');
  assert.equal(paceBand(80), 'slow');
  assert.equal(paceBand(200), 'fast');
  assert.equal(paceScore(140), 100);
  assert.ok(paceScore(80) < 60);
});

test('filler score falls as fillers rise', () => {
  assert.equal(fillerScore(1), 100);
  assert.ok(fillerScore(8) < 50);
  assert.equal(fillerScore(30), 0);
});

test('score carries a range and a wider margin without a model judgement', () => {
  const timed = Array.from({ length: 120 }, (_, i) => ({ word: 'x', start: i * 0.4, end: i * 0.4 + 0.3 }));
  const m = analyzeSpeech(words(120), { words: timed });
  const without = scoreSpeech(m);
  const withJudged = scoreSpeech(m, { structure: 80, relevance: 80 });
  assert.ok(without.margin > withJudged.margin);
  assert.equal(without.confidence, 'fair');
  assert.ok(without.score >= 0 && without.score <= 100);
});

test('good confidence needs enough speech and a model judgement', () => {
  const timed = Array.from({ length: 200 }, (_, i) => ({ word: 'x', start: i * 0.4, end: i * 0.4 + 0.3 }));
  const m = analyzeSpeech(words(200), { words: timed });
  assert.equal(scoreSpeech(m, { structure: 70 }).confidence, 'good');
  assert.equal(scoreSpeech(m).confidence, 'fair');
});
