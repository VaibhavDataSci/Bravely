"""
Analysis route: POST /api/analyze

Full pipeline:
    transcript text → preprocessing → Gemini → scoring → structured JSON
"""

import json
import logging
import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from analyzers.transcript import process_transcript
from schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisRequest,
    AnalysisDetail,
    FillerWordAnalysis,
    FillerWordDetail,
    FeedbackSection,
    Metrics,
    Scores,
    STARScore,
)
from scoring.engine import compute_final_scores
from services.gemini import invoke_gemini_analysis, invoke_question_generator
from utils.errors import (
    BravelyAIError,
    EmptyTranscriptError,
    TranscriptTooLongError,
)

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_TRANSCRIPT_CHARS = int(os.environ.get("MAX_TRANSCRIPT_CHARS", 15_000))


class QuestionRequest(BaseModel):
    resume_summary: str | None = None
    role: str | None = None
    interview_round: str | None = None
    context: str | None = Field(default="General", max_length=1200)
    experience_level: str | None = None
    variation_seed: str | None = None


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze a speech transcript",
    description=(
        "Accepts a raw speech transcript, preprocesses it, sends it to "
        "Google Gemini for deep communication analysis, and returns "
        "structured scores, feedback, and metrics."
    ),
)
async def analyze_transcript(body: AnalysisRequest):
    transcript = body.transcript.strip()

    # ── Guard: empty ──────────────────────────────────────────────────────────
    if not transcript:
        raise EmptyTranscriptError()

    # ── Guard: too long ───────────────────────────────────────────────────────
    if len(transcript) > MAX_TRANSCRIPT_CHARS:
        raise TranscriptTooLongError(MAX_TRANSCRIPT_CHARS)

    # ── Step 1: Preprocess transcript ─────────────────────────────────────────
    tm = process_transcript(transcript)
    logger.info(
        "Transcript preprocessed | words=%d sentences=%d fillers=%d",
        tm.word_count, tm.sentence_count, tm.total_filler_count,
    )

    # ── Step 2: Call Gemini ───────────────────────────────────────────────────
    raw = await invoke_gemini_analysis(
        transcript=tm.cleaned_text,
        context=body.context,
        session_type=body.session_type or "solo",
    )

    # ── Step 3: Compute final scores ──────────────────────────────────────────
    bedrock_scores = raw.get("scores", {})
    final = compute_final_scores(bedrock_scores, tm.filler_score)

    # ── Step 4: Assemble response ─────────────────────────────────────────────
    star_raw = raw.get("star", {})
    star = STARScore(
        situation=_safe_score(star_raw.get("situation")),
        task=_safe_score(star_raw.get("task")),
        action=_safe_score(star_raw.get("action")),
        result=_safe_score(star_raw.get("result")),
        overall=final.star_score,
        feedback=star_raw.get("feedback", "No STAR structure feedback available."),
    )

    filler_details = [
        FillerWordDetail(
            word=fw.word,
            count=fw.count,
            percentage=fw.percentage,
        )
        for fw in tm.filler_words
    ]

    filler_analysis = FillerWordAnalysis(
        total_count=tm.total_filler_count,
        total_percentage=tm.total_filler_percentage,
        detected=filler_details,
    )

    analysis = AnalysisDetail(
        clarity=raw.get("clarity", ""),
        confidence=raw.get("confidence", ""),
        coherence=raw.get("coherence", ""),
        vocabulary_richness=raw.get("vocabulary_richness", ""),
        sentence_completion=raw.get("sentence_completion", ""),
        speaking_pace=raw.get("speaking_pace", ""),
        communication_quality=raw.get("communication_quality", ""),
        star_structure=star,
        filler_words=filler_analysis,
    )

    feedback = FeedbackSection(
        strengths=raw.get("strengths", []),
        improvements=raw.get("improvements", []),
        actionable_tip=raw.get("actionable_tip", ""),
    )

    scores = Scores(
        clarity_score=final.clarity_score,
        confidence_score=final.confidence_score,
        filler_score=final.filler_score,
        vocabulary_score=final.vocabulary_score,
        star_score=final.star_score,
        overall_score=final.overall_score,
    )

    metrics = Metrics(
        word_count=tm.word_count,
        sentence_count=tm.sentence_count,
        avg_sentence_length=tm.avg_sentence_length,
        estimated_duration_seconds=tm.estimated_duration_seconds,
        words_per_minute=tm.words_per_minute,
        unique_word_ratio=tm.unique_word_ratio,
    )

    return AnalysisResponse(
        success=True,
        scores=scores,
        feedback=feedback,
        analysis=analysis,
        metrics=metrics,
    )


@router.post(
    "/questions",
    summary="Generate interview questions from resume",
    description="Generates a tailored set of interview questions based on the resume and selected interview mode.",
)
async def generate_questions(body: QuestionRequest):
    resume_summary = (body.resume_summary or "").strip()
    payload = await invoke_question_generator(
        resume_summary=resume_summary,
        role=body.role or "Interview",
        interview_round=body.interview_round or "behavioral",
        context=body.context or "General",
        experience_level=body.experience_level,
        variation_seed=body.variation_seed,
    )

    questions = payload.get("questions", [])
    normalized = []
    for item in questions:
        if isinstance(item, str):
            normalized.append({"question": item, "reason": "Tailored to candidate resume and interview mode."})
        elif isinstance(item, dict) and item.get("question"):
            normalized.append({
                "question": item.get("question"),
                "reason": item.get("reason", "Tailored to candidate resume and interview mode."),
            })

    if not normalized:
        normalized = [
            {"question": "Tell me about yourself and highlight one project from your resume.", "reason": "Baseline fallback."},
        ]

    return {
        "success": True,
        "questions": normalized[:5],
    }


def _safe_score(value) -> float:
    """Coerce any model-returned score to a valid 0–100 float."""
    try:
        return max(0.0, min(100.0, float(value)))
    except (TypeError, ValueError):
        return 50.0
