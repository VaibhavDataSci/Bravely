"""
AWS Bedrock integration service for Bravely AI.

Calls Claude via the Bedrock Runtime converse API, parses the JSON response,
and maps it to the internal domain model. Never exposes AWS credentials
or system prompts to the caller.
"""

import json
import logging
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError, EndpointResolutionError
from botocore.config import Config

from prompts.templates import SYSTEM_PROMPT, QUESTION_SYSTEM_PROMPT, build_analysis_prompt, build_question_prompt
from utils.errors import (
    BedrockAPIError,
    BedrockTimeoutError,
    MalformedBedrockResponseError,
)

logger = logging.getLogger(__name__)

# ─── Client (lazy singleton) ──────────────────────────────────────────────────

_client = None


def _get_client():
    global _client
    if _client is None:
        region = os.environ.get("AWS_REGION", "us-east-1")
        _client = boto3.client(
            "bedrock-runtime",
            region_name=region,
            config=Config(
                connect_timeout=10,
                read_timeout=60,
                retries={"max_attempts": 2, "mode": "standard"},
            ),
        )
    return _client


# ─── Model ID ─────────────────────────────────────────────────────────────────

def _model_id() -> str:
    return os.environ.get("CLAUDE_MODEL_ID", "anthropic.claude-sonnet-4-5")


# ─── Core Call ────────────────────────────────────────────────────────────────

async def invoke_claude(
    transcript: str,
    context: str | None = None,
    session_type: str = "solo",
) -> dict[str, Any]:
    """
    Send the preprocessed transcript to Claude via Bedrock and return
    the parsed JSON payload.

    Raises:
        BedrockTimeoutError: on read timeout
        BedrockAPIError: on any AWS-side error
        MalformedBedrockResponseError: if Claude's output is not valid JSON
    """
    user_prompt = build_analysis_prompt(transcript, context, session_type)

    try:
        client = _get_client()
        response = client.converse(
            modelId=_model_id(),
            system=[{"text": SYSTEM_PROMPT}],
            messages=[
                {
                    "role": "user",
                    "content": [{"text": user_prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": 1024,
                "temperature": 0.3,   # deterministic scoring
                "topP": 0.9,
            },
        )
    except client.exceptions.ModelTimeoutException:
        logger.error("Bedrock model timeout for session_type=%s", session_type)
        raise BedrockTimeoutError()
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        logger.error("Bedrock ClientError: %s", error_code)
        if "Throttling" in error_code:
            raise BedrockAPIError("AI service is currently rate-limited. Please try again shortly.")
        if "AccessDenied" in error_code:
            raise BedrockAPIError("AI service access is not configured correctly.")
        raise BedrockAPIError(f"AWS error: {error_code}")
    except Exception as exc:
        logger.error("Unexpected Bedrock error: %s", exc)
        raise BedrockAPIError()

    # Parse response
    try:
        raw_text = response["output"]["message"]["content"][0]["text"]
        # Strip any accidental markdown code fences
        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        payload = json.loads(raw_text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse Bedrock response: %s", exc)
        raise MalformedBedrockResponseError()

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
        client = _get_client()
        response = client.converse(
            modelId=_model_id(),
            system=[{"text": QUESTION_SYSTEM_PROMPT}],
            messages=[
                {
                    "role": "user",
                    "content": [{"text": user_prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": 900,
                "temperature": 0.6,
                "topP": 0.9,
            },
        )
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        logger.error("Bedrock question-generator ClientError: %s", error_code)
        raise BedrockAPIError(f"AWS error: {error_code}")
    except Exception as exc:
        logger.error("Unexpected Bedrock question-generator error: %s", exc)
        raise BedrockAPIError()

    try:
        raw_text = response["output"]["message"]["content"][0]["text"].strip()
        if raw_text.startswith("```"):
          raw_text = raw_text.split("```")[1]
          if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        payload = json.loads(raw_text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse question-generation response: %s", exc)
        raise MalformedBedrockResponseError()

    return payload
