"""
Custom exception hierarchy for the Bravely AI Service.
All errors here produce structured JSON responses and never leak
internal system prompts or credentials.
"""

import logging
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


# ─── Domain Exceptions ────────────────────────────────────────────────────────

class BravelyAIError(Exception):
    """Base class for all AI service errors."""
    status_code: int = 500
    error_code: str = "AI_SERVICE_ERROR"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class EmptyTranscriptError(BravelyAIError):
    status_code = 400
    error_code = "EMPTY_TRANSCRIPT"

    def __init__(self):
        super().__init__("Transcript cannot be empty.")


class TranscriptTooLongError(BravelyAIError):
    status_code = 413
    error_code = "TRANSCRIPT_TOO_LONG"

    def __init__(self, max_chars: int):
        super().__init__(
            f"Transcript exceeds the maximum allowed length of {max_chars} characters."
        )


class InvalidTranscriptError(BravelyAIError):
    status_code = 422
    error_code = "INVALID_TRANSCRIPT"

    def __init__(self, detail: str = "Transcript contains invalid or unsafe content."):
        super().__init__(detail)


class BedrockTimeoutError(BravelyAIError):
    status_code = 504
    error_code = "BEDROCK_TIMEOUT"

    def __init__(self):
        super().__init__(
            "The AI analysis request timed out. Please try again."
        )


class BedrockAPIError(BravelyAIError):
    status_code = 502
    error_code = "BEDROCK_API_ERROR"

    def __init__(self, detail: str = "AWS Bedrock returned an unexpected error."):
        super().__init__(detail)


class MalformedBedrockResponseError(BravelyAIError):
    status_code = 502
    error_code = "MALFORMED_AI_RESPONSE"

    def __init__(self):
        super().__init__(
            "The AI model returned a response that could not be parsed."
        )


class GeminiTimeoutError(BravelyAIError):
    status_code = 504
    error_code = "GEMINI_TIMEOUT"

    def __init__(self):
        super().__init__(
            "The AI analysis request timed out. Please try again."
        )


class GeminiAPIError(BravelyAIError):
    status_code = 502
    error_code = "GEMINI_API_ERROR"

    def __init__(self, detail: str = "Gemini returned an unexpected error."):
        super().__init__(detail)


class MalformedGeminiResponseError(BravelyAIError):
    status_code = 502
    error_code = "MALFORMED_AI_RESPONSE"

    def __init__(self):
        super().__init__(
            "The AI model returned a response that could not be parsed."
        )


# ─── FastAPI Exception Handlers ───────────────────────────────────────────────

def _error_response(status_code: int, error_code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
            },
        },
    )


async def bravely_error_handler(request: Request, exc: BravelyAIError) -> JSONResponse:
    return _error_response(exc.status_code, exc.error_code, exc.message)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return _error_response(exc.status_code, "HTTP_ERROR", exc.detail)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log but never expose internal details
    logger.exception("Unhandled exception during request:")
    return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred.")
