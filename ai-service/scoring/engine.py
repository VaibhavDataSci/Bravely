"""
Scoring engine for the Bravely AI Service.

Combines raw scores from Gemini with locally computed
filler word metrics to produce final normalized 0–100 scores.
"""

from __future__ import annotations
from dataclasses import dataclass


@dataclass
class FinalScores:
    clarity_score: float
    confidence_score: float
    filler_score: float
    vocabulary_score: float
    star_score: float
    overall_score: float


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    """Ensure value is within [lo, hi]."""
    return round(max(lo, min(hi, float(value))), 1)


def compute_final_scores(
    bedrock_scores: dict,
    filler_score: float,
) -> FinalScores:
    """
    Merge Gemini-returned scores with locally computed filler score.

    Args:
        bedrock_scores: dict with keys clarity_score, confidence_score,
                vocabulary_score, star_score, overall_score (0–100 ints from Gemini)
        filler_score:   locally computed score where 100 = no filler words

    Returns:
        FinalScores with all values clamped to 0–100.
    """
    clarity    = clamp(bedrock_scores.get("clarity_score", 50))
    confidence = clamp(bedrock_scores.get("confidence_score", 50))
    vocabulary = clamp(bedrock_scores.get("vocabulary_score", 50))
    star       = clamp(bedrock_scores.get("star_score", 50))
    filler     = clamp(filler_score)

    # Weighted overall: model overall is authoritative but we blend filler in
    claude_overall = clamp(bedrock_scores.get("overall_score", 50))
    blended_overall = clamp(
        claude_overall * 0.75 + filler * 0.25
    )

    return FinalScores(
        clarity_score=clarity,
        confidence_score=confidence,
        filler_score=filler,
        vocabulary_score=vocabulary,
        star_score=star,
        overall_score=blended_overall,
    )
