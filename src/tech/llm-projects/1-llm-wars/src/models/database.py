"""
Database models for LLM Wars
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class Battle(Base):
    """Battle table in PostgreSQL"""

    __tablename__ = "battles"

    id = Column(String, primary_key=True)
    config = Column(JSON, nullable=False)  # BattleConfig as JSON
    messages = Column(JSON, nullable=False, default=list)  # List of BattleMessage as JSON
    status = Column(String, nullable=False)
    current_round = Column(String, default="0")  # Stored as string for JSON compatibility
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Vote(Base):
    """Vote table in PostgreSQL - stores individual votes for battles"""

    __tablename__ = "votes"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    battle_id = Column(String, ForeignKey("battles.id"), nullable=False, index=True)
    provider = Column(String, nullable=False)  # 'openai', 'claude', or 'grok'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


def get_engine(database_url: str):
    """Create SQLAlchemy engine"""
    return create_engine(database_url, pool_pre_ping=True)


def get_session_factory(engine):
    """Create session factory"""
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db(engine):
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
