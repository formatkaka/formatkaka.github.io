"""
Application configuration
"""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file from project root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
  openai_api_key: str = ""
  anthropic_api_key: str = ""
  grok_api_key: str = ""
  database_url: str = ""  # Automatically reads from DATABASE_URL env var (case-insensitive)
  environment: str = "development"

  class Config:
    case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
  return Settings()
