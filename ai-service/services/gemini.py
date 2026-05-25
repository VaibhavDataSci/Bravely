"""
Google Gemini integration service for Bravely AI.

Calls Gemini via the Google Generative AI SDK, parses the JSON response,
and maps it to the internal domain model. Never exposes API keys or
system prompts to the caller.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import google.generativeai as genai
from google.api_core.exceptions import GoogleAPICallError, RetryError, DeadlineExceeded

from prompts.templates import SYSTEM_PROMPT, QUESTION_SYSTEM_PROMPT, build_analysis_prompt, build_question_prompt
from utils.errors import (
    GeminiAPIError,
    GeminiTimeoutError,
    MalformedGeminiResponseError,
)

logger = logging.getLogger(__name__)

_analysis_model = None
_question_model = None


def _get_model(system_prompt: str):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiAPIError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    return genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_prompt,
    )


def _get_analysis_model():
    global _analysis_model
    if _analysis_model is None:
        _analysis_model = _get_model(SYSTEM_PROMPT)
    return _analysis_model


def _get_question_model():
    global _question_model
    if _question_model is None:
        _question_model = _get_model(QUESTION_SYSTEM_PROMPT)
    return _question_model


def _extract_json(text: str) -> dict[str, Any]:
    raw_text = text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 1)[1]
        if raw_text.lstrip().startswith("json"):
            raw_text = raw_text.lstrip()[4:]
    if not raw_text.startswith("{"):
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start >= 0 and end > start:
            raw_text = raw_text[start:end + 1]
    return json.loads(raw_text)


async def invoke_gemini_analysis(
    transcript: str,
    context: str | None = None,
    session_type: str = "solo",
) -> dict[str, Any]:
    """
    Send the preprocessed transcript to Gemini and return the parsed JSON payload.

    Raises:
        GeminiTimeoutError: on read timeout
        GeminiAPIError: on any Gemini-side error
        MalformedGeminiResponseError: if Gemini output is not valid JSON
    """
    user_prompt = build_analysis_prompt(transcript, context, session_type)

    try:
        model = _get_analysis_model()
        response = model.generate_content(
            user_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=4096,
                temperature=0.3,
                top_p=0.9,
                response_mime_type="application/json",
            ),
        )
    except DeadlineExceeded:
        logger.error("Gemini model timeout for session_type=%s", session_type)
        raise GeminiTimeoutError()
    except (GoogleAPICallError, RetryError) as exc:
        logger.error("Gemini API error: %s", exc)
        raise GeminiAPIError("Gemini returned an unexpected error.")
    except Exception as exc:
        logger.error("Unexpected Gemini error: %s", exc)
        raise GeminiAPIError()

    try:
        payload = _extract_json(response.text or "")
    except (AttributeError, TypeError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse Gemini response: %s", exc)
        raise MalformedGeminiResponseError()

    return payload


async def invoke_question_generator(
    resume_summary: str,
    role: str,
    interview_round: str,
    context: str,
    experience_level: str | None = None,
    variation_seed: str | None = None,
) -> dict[str, Any]:
    user_prompt = build_question_prompt(
        resume_summary=resume_summary,
        role=role,
        interview_round=interview_round,
        context=context,
        experience_level=experience_level,
        variation_seed=variation_seed,
    )

    try:
        model = _get_question_model()
        response = model.generate_content(
            user_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=2048,
                temperature=0.6,
                top_p=0.9,
                response_mime_type="application/json",
            ),
        )
    except (GoogleAPICallError, RetryError) as exc:
        logger.error("Gemini question-generator API error: %s", exc)
        raise GeminiAPIError("Gemini returned an unexpected error.")
    except Exception as exc:
        logger.error("Unexpected Gemini question-generator error: %s", exc)
        raise GeminiAPIError()

    try:
        payload = _extract_json(response.text or "")
    except (AttributeError, TypeError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse question-generation response: %s", exc)
        raise MalformedGeminiResponseError()

    return payload
