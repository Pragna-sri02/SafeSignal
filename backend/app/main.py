from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routers import (
    profile,
    contacts,
    physical_safety,
    digital_safety,
    assistant,
    evidence,
    help_directory
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure RAG vector/metadata index is loaded
    print("[SafeSignal] Backend starting up...")
    try:
        from rag.retriever import safety_retriever
        print(f"[SafeSignal] Knowledge base initialized with {len(safety_retriever.chunks)} chunks.")
    except Exception as e:
        print(f"[SafeSignal] Knowledge base load warning: {e}")
    yield
    print("[SafeSignal] Backend shutting down.")

app = FastAPI(
    title="SafeSignal API",
    version="1.0.0",
    description="Unified Women's Safety Platform - Combining Physical Emergency Response, Digital Protection, and Grounded AI Guidance",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "error_detail": str(exc)
        }
    )

# Mount Routers
app.include_router(profile.router)
app.include_router(contacts.router)
app.include_router(physical_safety.router)
app.include_router(digital_safety.router)
app.include_router(assistant.router)
app.include_router(evidence.router)
app.include_router(help_directory.router)

@app.get("/", tags=["System"])
async def root():
    return {
        "platform": "SafeSignal",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "demo_mode": settings.DEMO_MODE,
        "gemini_active": bool(settings.GEMINI_API_KEY)
    }

@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "rag_knowledge_base": "ok",
            "demo_dispatcher": "active"
        }
    }
