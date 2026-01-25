"""
LLM Wars - FastAPI application
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import battle

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
  """Application lifespan events"""
  print("🚀 LLM Wars API starting...")

  openai_key = os.getenv("OPENAI_API_KEY")
  anthropic_key = os.getenv("ANTHROPIC_API_KEY")
  grok_key = os.getenv("GROK_API_KEY")

  if not openai_key:
    print("⚠️  Warning: OPENAI_API_KEY not found")
  else:
    print(f"✅ OPENAI_API_KEY loaded ({openai_key[:8]}...)")

  if not anthropic_key:
    print("⚠️  Warning: ANTHROPIC_API_KEY not found")
  else:
    print(f"✅ ANTHROPIC_API_KEY loaded ({anthropic_key[:8]}...)")

  if not grok_key:
    print("⚠️  Warning: GROK_API_KEY not found")
  else:
    print(f"✅ GROK_API_KEY loaded ({grok_key[:8]}...)")

  print("✅ LLM Wars API ready!")
  yield
  print("👋 LLM Wars API shutting down...")


app = FastAPI(
  title="LLM Wars API",
  description="API for LLM battles and experiments",
  version="0.1.0",
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:4321",
    "http://localhost:3000",
    "https://formatkaka.github.io",
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(battle.router)


@app.get("/")
async def root():
  """Root endpoint"""
  return {
    "message": "LLM Wars API",
    "version": "0.1.0",
    "status": "running",
  }


@app.get("/health")
async def health():
  """Health check endpoint"""
  return {"status": "healthy"}


if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=5123)
