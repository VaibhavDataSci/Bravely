"""
Bravely AI Service — FastAPI application entry point.

Exposes:
  POST /api/analyze   — full transcript analysis pipeline
  GET  /health        — liveness probe
"""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from routes.analysis import router as analysis_router
from utils.errors import (
    BravelyAIError,
    bravely_error_handler,
    http_exception_handler,
    generic_exception_handler,
)

# ─── Load Environment ──────────────────────────────────────────────────────────
load_dotenv()

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("bravely.ai")


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Bravely AI Service starting up…")
    yield
    logger.info("Bravely AI Service shutting down.")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bravely AI Service",
    description=(
        "AI-powered communication analysis pipeline for Bravely. "
        "Processes speech transcripts via Google Gemini and returns "
        "structured scores, STAR framework analysis, and coaching feedback."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ─── CORS ─────────────────────────────────────────────────────────────────────

allowed_origins_raw = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ─── Exception Handlers ───────────────────────────────────────────────────────

app.add_exception_handler(BravelyAIError, bravely_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    errors = exc.errors()
    first = errors[0] if errors else {}
    msg = first.get("msg", "Invalid request data.")
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": {"code": "VALIDATION_ERROR", "message": msg}},
    )


# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(analysis_router, prefix="/api", tags=["Analysis"])


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "bravely-ai"}


# ─── Dev Entrypoint ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
        log_level=os.environ.get("LOG_LEVEL", "info").lower(),
    )
