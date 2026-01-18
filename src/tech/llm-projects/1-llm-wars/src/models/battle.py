"""
Pydantic models for LLM Battle system
"""

from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class LLMProvider(str, Enum):
    """Supported LLM providers"""

    OPENAI = "openai"
    CLAUDE = "claude"
    GROK = "grok"


class BattleMode(str, Enum):
    """Battle response modes"""

    TEXT = "text"
    EMOJI = "emoji"


class BattleStatus(str, Enum):
    """Current state of a battle"""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ERROR = "error"


class LLMConfig(BaseModel):
    """Configuration for a single LLM participant"""

    provider: LLMProvider
    persona: str = Field(
        ...,
        description="The personality/role this LLM should adopt",
        min_length=1,
        max_length=500,
    )
    name: str = Field(
        default="",
        description="Display name for this participant",
        max_length=50,
    )

    def model_post_init(self, __context) -> None:
        if not self.name:
            self.name = self.provider.value.capitalize()


class BattleConfig(BaseModel):
    """Configuration for a battle session"""

    topic: str = Field(
        ...,
        description="The topic/question for LLMs to discuss",
        min_length=1,
        max_length=1000,
    )
    mode: BattleMode = Field(
        default=BattleMode.TEXT,
        description="Response mode for the battle",
    )
    rounds: int = Field(
        default=3,
        description="Number of rounds in the battle",
        ge=1,
        le=10,
    )
    llms: list[LLMConfig] = Field(
        ...,
        description="List of LLM participants (exactly 3)",
        min_length=3,
        max_length=3,
    )


class BattleMessage(BaseModel):
    """A single message in the battle conversation"""

    provider: LLMProvider
    name: str
    content: str
    round_number: int


class BattleState(BaseModel):
    """Current state of a battle"""

    id: str = Field(default_factory=lambda: str(uuid4()))
    config: BattleConfig
    messages: list[BattleMessage] = Field(default_factory=list)
    current_round: int = Field(default=0)
    status: BattleStatus = Field(default=BattleStatus.PENDING)
    error_message: str | None = None


class BattleRequest(BaseModel):
    """API request to start a new battle"""

    topic: str = Field(..., min_length=1, max_length=1000)
    mode: BattleMode = BattleMode.TEXT
    rounds: int = Field(default=3, ge=1, le=10)
    llms: list[LLMConfig]


class BattleResponse(BaseModel):
    """API response for battle status/results"""

    id: str
    status: BattleStatus
    current_round: int
    total_rounds: int
    messages: list[BattleMessage]
    error_message: str | None = None
