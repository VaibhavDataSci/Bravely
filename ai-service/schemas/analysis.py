"""
Pydantic v2 schemas for the Bravely AI Service analysis pipeline.
All fields are strictly typed and validated.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator


# ─── Request ──────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    transcript: str = Field(
        ...,
        min_length=1,
        description="Raw transcript text from a speech session."
    )
    context: str | None = Field(
        default=None,
        max_length=500,
        description="Optional context: interview type, role, question prompt, etc."
    )
    session_type: str | None = Field(
        default="solo",
        description="Type of session: solo | p2p | group | daily | coding"
    )
    duration: float | None = Field(
        default=None,
        description="Optional actual duration in seconds."
    )

    @field_validator("transcript")
    @classmethod
    def no_injection(cls, v: str) -> str:
        # Strip common prompt-injection patterns
        dangerous = [
            "ignore previous instructions",
            "ignore all instructions",
            "disregard",
            "system:",
            "<|im_start|>",
            "<|system|>",
            "forget everything",
        ]
        lower = v.lower()
        for pattern in dangerous:
            if pattern in lower:
                raise ValueError("Transcript contains disallowed content.")
        return v.strip()

    @field_validator("context")
    @classmethod
    def sanitize_context(cls, v: str | None) -> str | None:
        if v is None:
            return v
        dangerous = ["ignore", "system:", "<|im_start|>"]
        lower = v.lower()
        for p in dangerous:
            if p in lower:
                raise ValueError("Context contains disallowed content.")
        return v.strip()


# ─── Sub-Models ───────────────────────────────────────────────────────────────

class FillerWordDetail(BaseModel):
    word: str
    count: int
    percentage: float = Field(ge=0.0, le=100.0)


class FillerWordAnalysis(BaseModel):
    total_count: int
    total_percentage: float = Field(ge=0.0, le=100.0)
    detected: list[FillerWordDetail]


class STARScore(BaseModel):
    situation: float = Field(ge=0.0, le=100.0)
    task: float = Field(ge=0.0, le=100.0)
    action: float = Field(ge=0.0, le=100.0)
    result: float = Field(ge=0.0, le=100.0)
    overall: float = Field(ge=0.0, le=100.0)
    feedback: str


class Scores(BaseModel):
    clarity_score: float = Field(ge=0.0, le=100.0)
    confidence_score: float = Field(ge=0.0, le=100.0)
    filler_score: float = Field(ge=0.0, le=100.0, description="100 = zero fillers")
    vocabulary_score: float = Field(ge=0.0, le=100.0)
    star_score: float = Field(ge=0.0, le=100.0)
    overall_score: float = Field(ge=0.0, le=100.0)


class FeedbackSection(BaseModel):
    strengths: list[str]
    improvements: list[str]
    actionable_tip: str


class AnalysisDetail(BaseModel):
    clarity: str
    confidence: str
    coherence: str
    vocabulary_richness: str
    sentence_completion: str
    speaking_pace: str
    communication_quality: str
    star_structure: STARScore
    filler_words: FillerWordAnalysis


class Metrics(BaseModel):
    word_count: int
    sentence_count: int
    avg_sentence_length: float
    estimated_duration_seconds: float
    words_per_minute: float
    unique_word_ratio: float


# ─── Response ─────────────────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    success: bool = True
    scores: Scores
    feedback: FeedbackSection
    analysis: AnalysisDetail
    metrics: Metrics


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
