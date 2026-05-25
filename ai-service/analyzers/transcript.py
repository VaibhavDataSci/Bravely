"""
Transcript preprocessing and linguistic analysis.

Handles:
- Cleaning and normalization
- Filler word detection + counting
- Sentence splitting
- Speaking pace estimation
- Basic NLP metrics
"""

import re
from dataclasses import dataclass, field


# ─── Filler Words Registry ────────────────────────────────────────────────────

FILLER_WORDS: list[str] = [
    "um", "uh", "like", "basically", "you know",
    "sort of", "kind of", "right", "so", "actually",
    "literally", "i mean", "you see",
]


# ─── Data Classes ─────────────────────────────────────────────────────────────

@dataclass
class FillerWord:
    word: str
    count: int
    percentage: float


@dataclass
class TranscriptMetrics:
    cleaned_text: str
    sentences: list[str]
    word_count: int
    sentence_count: int
    avg_sentence_length: float
    unique_word_ratio: float
    estimated_duration_seconds: float
    words_per_minute: float
    filler_words: list[FillerWord]
    total_filler_count: int
    total_filler_percentage: float
    filler_score: float  # 0–100, higher = fewer fillers


# ─── Preprocessing ────────────────────────────────────────────────────────────

def clean_transcript(raw: str) -> str:
    """
    Normalize punctuation, strip noise characters, collapse whitespace.
    Preserves sentence-ending punctuation.
    """
    text = raw.strip()
    # Collapse repeated whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    # Normalize line breaks to spaces (speech is one stream)
    text = re.sub(r'\n+', ' ', text)
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E]', '', text)
    # Normalize ellipsis
    text = re.sub(r'\.{2,}', '.', text)
    # Normalize multiple punctuation
    text = re.sub(r'([!?]){2,}', r'\1', text)
    # Ensure sentence endings have a single space after
    text = re.sub(r'([.!?])\s*', r'\1 ', text)
    return text.strip()


def split_sentences(text: str) -> list[str]:
    """
    Split cleaned text into sentences using regex heuristic.
    """
    raw_sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in raw_sentences if len(s.strip()) > 2]


def tokenize_words(text: str) -> list[str]:
    """Return a list of lowercase alphabetic tokens."""
    return re.findall(r"[a-z']+", text.lower())


# ─── Filler Word Detection ────────────────────────────────────────────────────

def detect_filler_words(text: str, word_count: int) -> tuple[list[FillerWord], int, float]:
    """
    Detect and count filler words in the transcript.
    Returns (list of FillerWord, total_count, total_percentage).
    """
    lower_text = text.lower()
    results: list[FillerWord] = []
    total = 0

    for phrase in FILLER_WORDS:
        # Use word-boundary matching for single words
        if ' ' in phrase:
            pattern = re.compile(r'\b' + re.escape(phrase) + r'\b')
        else:
            pattern = re.compile(r'\b' + re.escape(phrase) + r'\b')
        count = len(pattern.findall(lower_text))
        if count > 0:
            pct = round((count / max(word_count, 1)) * 100, 2)
            results.append(FillerWord(word=phrase, count=count, percentage=pct))
            total += count

    total_pct = round((total / max(word_count, 1)) * 100, 2)
    results.sort(key=lambda f: f.count, reverse=True)
    return results, total, total_pct


def compute_filler_score(total_filler_pct: float) -> float:
    """
    Convert filler word percentage to a 0–100 score.
    0% fillers → 100 score. 20%+ fillers → ~0 score.
    Uses a smooth exponential decay.
    """
    import math
    score = 100 * math.exp(-0.2 * total_filler_pct)
    return round(max(0.0, min(100.0, score)), 1)


# ─── NLP Metrics ─────────────────────────────────────────────────────────────

def estimate_duration(word_count: int, wpm: float = 130.0) -> float:
    """Estimate speaking duration in seconds at a given words-per-minute."""
    return round((word_count / wpm) * 60, 1)


def unique_word_ratio(words: list[str]) -> float:
    if not words:
        return 0.0
    return round(len(set(words)) / len(words), 3)


# ─── Main Entry Point ─────────────────────────────────────────────────────────

def process_transcript(raw_transcript: str, duration_seconds: float | None = None) -> TranscriptMetrics:
    """
    Full preprocessing pipeline: clean → split → tokenize → detect fillers → metrics.
    """
    cleaned = clean_transcript(raw_transcript)
    sentences = split_sentences(cleaned)
    words = tokenize_words(cleaned)

    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = round(word_count / sentence_count, 1)
    unique_ratio = unique_word_ratio(words)
    if duration_seconds and duration_seconds > 0:
        duration = float(duration_seconds)
    else:
        duration = estimate_duration(word_count)
    wpm = round((word_count / max(duration, 1)) * 60, 1)

    fillers, total_filler_count, total_filler_pct = detect_filler_words(cleaned, word_count)
    filler_score = compute_filler_score(total_filler_pct)

    return TranscriptMetrics(
        cleaned_text=cleaned,
        sentences=sentences,
        word_count=word_count,
        sentence_count=sentence_count,
        avg_sentence_length=avg_sentence_length,
        unique_word_ratio=unique_ratio,
        estimated_duration_seconds=duration,
        words_per_minute=wpm,
        filler_words=fillers,
        total_filler_count=total_filler_count,
        total_filler_percentage=total_filler_pct,
        filler_score=filler_score,
    )
