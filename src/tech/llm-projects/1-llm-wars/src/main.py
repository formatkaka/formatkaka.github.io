"""
LLM Wars - FastAPI application
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from galileo import galileo_context
import uvicorn

from src.config import get_settings
from src.models.database import get_engine, get_session_factory, init_db
from src.routes import battle
from src.services.battle_service import BattleService

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
  """Application lifespan events"""
  print("🚀 LLM Wars API starting...")

  settings = get_settings()
  
  # Check API keys
  if not settings.openai_api_key:
    print("⚠️  Warning: OPENAI_API_KEY not found")
  else:
    print(f"✅ OPENAI_API_KEY loaded ({settings.openai_api_key[:8]}...)")

  if not settings.anthropic_api_key:
    print("⚠️  Warning: ANTHROPIC_API_KEY not found")
  else:
    print(f"✅ ANTHROPIC_API_KEY loaded ({settings.anthropic_api_key[:8]}...)")

  if not settings.grok_api_key:
    print("⚠️  Warning: GROK_API_KEY not found")
  else:
    print(f"✅ GROK_API_KEY loaded ({settings.grok_api_key[:8]}...)")

  # Galileo for LLM tracing (GALILEO_API_KEY assumed set).
  # Set env so request-handler tasks (different asyncio tasks) see the project;
  # context vars set in lifespan don't propagate to other tasks.
  os.environ.setdefault("GALILEO_PROJECT", "LLM-Wars")
  os.environ.setdefault("GALILEO_LOG_STREAM", "development")
  galileo_context.init(project=os.environ.get("GALILEO_PROJECT"), log_stream=os.environ.get("GALILEO_LOG_STREAM"))
  print(f"✅ Galileo tracing enabled (project: {os.environ.get('GALILEO_PROJECT')}, log stream: {os.environ.get('GALILEO_LOG_STREAM')})")

  # Initialize database if DATABASE_URL is provided
  db_session = None
  if settings.database_url:
    try:
      print("📦 Initializing database...")
      engine = get_engine(settings.database_url)
      init_db(engine)
      SessionLocal = get_session_factory(engine)
      db_session = SessionLocal()
      print("✅ Database connected and initialized")
    except Exception as e:
      print(f"⚠️  Database connection failed: {e}")
      print("   Running without database persistence")
      db_session = None
  else:
    print("⚠️  No DATABASE_URL found - running without database persistence")

  # Initialize battle service with database session
  battle_service = BattleService(db_session=db_session)
  battle.set_battle_service(battle_service)

  print("✅ LLM Wars API ready!")
  yield
  
  # Cleanup
  if db_session:
    db_session.close()
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
  uvicorn.run(app, host="0.0.0.0", port=5123)
