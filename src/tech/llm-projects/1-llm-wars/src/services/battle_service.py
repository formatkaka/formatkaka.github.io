"""
Battle Service - Orchestrates turn-based LLM battles
"""

import asyncio
from collections import Counter
from collections.abc import AsyncGenerator
from typing import Optional

from sqlalchemy.orm import Session

from ..models.battle import (
    BattleConfig,
    BattleMessage,
    BattleRequest,
    BattleResponse,
    BattleState,
    BattleStatus,
    LLMConfig,
)
from ..models.database import Battle, Vote
from .llm_service import LLMService


class BattleService:
    """Service for orchestrating LLM battles"""

    def __init__(self, db_session: Optional[Session] = None) -> None:
        self._llm_service = LLMService()
        self._battles: dict[str, BattleState] = {}
        self._db_session = db_session

    def create_battle(self, request: BattleRequest) -> BattleState:
        """Create a new battle from request"""
        config = BattleConfig(
            topic=request.topic,
            mode=request.mode,
            language=request.language,
            rounds=request.rounds,
            llms=request.llms,
        )
        state = BattleState(config=config)
        self._battles[state.id] = state
        return state

    def get_battle(self, battle_id: str) -> BattleState | None:
        """Get battle state by ID - checks memory first, then database"""
        # Check memory first (for active battles)
        if battle_id in self._battles:
            return self._battles[battle_id]
        
        # Check database if session available
        if self._db_session:
            db_battle = self._db_session.query(Battle).filter(Battle.id == battle_id).first()
            if db_battle:
                return self._battle_from_db(db_battle)
        
        return None
    
    def _battle_from_db(self, db_battle: Battle) -> BattleState:
        """Convert database Battle to BattleState"""
        config_dict = db_battle.config
        config = BattleConfig(**config_dict)
        
        messages = [BattleMessage(**msg) for msg in db_battle.messages]
        
        state = BattleState(
            id=db_battle.id,
            config=config,
            messages=messages,
            current_round=int(db_battle.current_round),
            status=BattleStatus(db_battle.status),
            error_message=db_battle.error_message,
        )
        return state
    
    def save_battle(self, state: BattleState) -> None:
        """Save battle to database"""
        if not self._db_session:
            return
        
        try:
            db_battle = self._db_session.query(Battle).filter(Battle.id == state.id).first()
            
            battle_data = {
                "id": state.id,
                "config": state.config.model_dump(),
                "messages": [msg.model_dump() for msg in state.messages],
                "status": state.status.value,
                "current_round": str(state.current_round),
                "error_message": state.error_message,
            }
            
            if db_battle:
                # Update existing
                for key, value in battle_data.items():
                    setattr(db_battle, key, value)
            else:
                # Create new
                db_battle = Battle(**battle_data)
                self._db_session.add(db_battle)
            
            self._db_session.commit()
        except Exception as e:
            self._db_session.rollback()
            print(f"Error saving battle to database: {e}")
    
    def get_battle_config(self, battle_id: str) -> BattleConfig | None:
        """Get battle config for replay (from database)"""
        if not self._db_session:
            return None
        
        db_battle = self._db_session.query(Battle).filter(Battle.id == battle_id).first()
        if db_battle:
            return BattleConfig(**db_battle.config)
        return None

    def get_battle_response(self, state: BattleState) -> BattleResponse:
        """Convert battle state to API response"""
        return BattleResponse(
            id=state.id,
            status=state.status,
            current_round=state.current_round,
            total_rounds=state.config.rounds,
            messages=state.messages,
            error_message=state.error_message,
        )

    async def run_battle(self, battle_id: str) -> BattleState:
        """Run a complete battle (all rounds)"""
        state = self._battles.get(battle_id)
        if not state:
            raise ValueError(f"Battle not found: {battle_id}")

        state.status = BattleStatus.IN_PROGRESS

        try:
            for round_num in range(1, state.config.rounds + 1):
                state.current_round = round_num
                await self._run_round(state, round_num)

            state.status = BattleStatus.COMPLETED
            # Save to database after completion
            self.save_battle(state)
        except Exception as e:
            state.status = BattleStatus.ERROR
            state.error_message = str(e)
            self.save_battle(state)

        return state

    async def run_battle_streaming(
        self,
        battle_id: str,
    ) -> AsyncGenerator[BattleMessage, None]:
        """Run battle and yield messages as they're generated"""
        print(f"🎬 Starting battle streaming for: {battle_id}")
        state = self._battles.get(battle_id)
        if not state:
            raise ValueError(f"Battle not found: {battle_id}")

        # Clear any existing messages to ensure we only generate the configured number of rounds
        state.messages = []
        state.status = BattleStatus.IN_PROGRESS
        state.current_round = 0
        state.error_message = None
        print(f"📊 Battle status set to IN_PROGRESS, cleared messages")

        try:
            for round_num in range(1, state.config.rounds + 1):
                print(f"🔄 Starting round {round_num}/{state.config.rounds}")
                state.current_round = round_num

                for llm_config in state.config.llms:
                    print(f"🤖 [Round {round_num}] Generating response for {llm_config.provider}...")
                    print(f"   Current state: round={state.current_round}, messages_count={len(state.messages)}")
                    
                    response = await self._generate_llm_response(state, llm_config, round_num)
                    print(f"✅ [Round {round_num}] Got response from {llm_config.provider}: {response[:50]}...")

                    # Create message with explicit round number
                    message = self._create_message(llm_config, response, round_num)
                    print(f"   Created message: provider={message.provider}, round={message.round_number}")
                    
                    # Append to state immediately
                    state.messages.append(message)
                    print(f"📤 [Round {round_num}] Yielding message from {llm_config.provider} (round_number={message.round_number})...")
                    yield message

                    # Add delay between messages so users can read them
                    await asyncio.sleep(2.0)

            state.status = BattleStatus.COMPLETED
            # Save to database after completion
            self.save_battle(state)
        except Exception as e:
            state.status = BattleStatus.ERROR
            state.error_message = str(e)
            self.save_battle(state)
            raise

    def _create_message(
        self, llm_config: LLMConfig, content: str, round_num: int
    ) -> BattleMessage:
        """Create a battle message from LLM response"""
        return BattleMessage(
            provider=llm_config.provider,
            name=llm_config.name,
            content=content,
            round_number=round_num,
        )

    async def _generate_llm_response(
        self, state: BattleState, llm_config: LLMConfig, round_num: int
    ) -> str:
        """Generate response from an LLM"""
        # Pass a copy of messages to ensure each LLM sees the conversation as it was
        # at the time of the call, preventing race conditions
        conversation_history = state.messages.copy()
        return await self._llm_service.generate_response(
            provider=llm_config.provider,
            persona=llm_config.persona,
            message=state.config.topic,
            mode=state.config.mode,
            language=state.config.language,
            conversation_history=conversation_history,
            current_round=round_num,
        )

    async def _run_round(self, state: BattleState, round_num: int) -> None:
        """Run a single round - each LLM responds once"""
        for llm_config in state.config.llms:
            response = await self._generate_llm_response(state, llm_config, round_num)
            message = self._create_message(llm_config, response, round_num)
            state.messages.append(message)

    def get_all_battles(self) -> list[BattleResponse]:
        """Get all battles as responses"""
        return [self.get_battle_response(state) for state in self._battles.values()]

    def clear_battles(self) -> None:
        """Clear all battles (for testing)"""
        self._battles.clear()
    
    def save_vote(self, battle_id: str, provider: str) -> None:
        """Save a vote for a battle"""
        if not self._db_session:
            return
        
        try:
            vote = Vote(battle_id=battle_id, provider=provider)
            self._db_session.add(vote)
            self._db_session.commit()
        except Exception as e:
            self._db_session.rollback()
            print(f"Error saving vote to database: {e}")
            raise
    
    def get_vote_counts(self, battle_id: str) -> dict[str, int]:
        """Get vote counts for a battle by provider"""
        default_counts = {"openai": 0, "claude": 0, "grok": 0}
        
        if not self._db_session:
            return default_counts
        
        try:
            votes = self._db_session.query(Vote).filter(Vote.battle_id == battle_id).all()
            counts = Counter(vote.provider for vote in votes)
            return {**default_counts, **counts}
        except Exception as e:
            print(f"Error getting vote counts from database: {e}")
            return default_counts