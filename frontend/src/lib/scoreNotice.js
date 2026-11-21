// Shown next to every score. Keep in sync with SCORE_NOTICE in server/src/modules/ai/routes.js.
export const SCORE_NOTICE =
  'Scores are practice feedback from automated speech-to-text and an AI model. Transcription is less accurate for some accents, speech differences and noisy audio, filler words are often undercounted, and the AI can mis-score. Use scores to track your own progress. This is not a clinical, exam or hiring assessment.';

export const PART_LABELS = {
  pace: 'Speaking pace',
  fillers: 'Filler control',
  vocabulary: 'Vocabulary',
  pauses: 'Pauses',
  structure: 'Structure',
  relevance: 'Relevance',
};

export const MODE_LABELS = { general: 'Free practice', interview: 'Interview', discussion: 'Discussion', daily: 'Daily practice' };
