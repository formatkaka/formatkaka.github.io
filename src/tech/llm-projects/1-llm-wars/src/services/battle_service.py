"""
Battle Service - Orchestrates turn-based LLM battles
"""

import asyncio
from collections.abc import AsyncGenerator

from ..models.battle import (
    BattleConfig,
    BattleMessage,
    BattleRequest,
    BattleResponse,
    BattleState,
    BattleStatus,
)
from .llm_service import LLMService


class BattleService:
    """Service for orchestrating LLM battles"""

    def __init__(self) -> None:
        self._llm_service = LLMService()
        self._battles: dict[str, BattleState] = {}

    def create_battle(self, request: BattleRequest) -> BattleState:
        """Create a new battle from request"""
        config = BattleConfig(
            topic=request.topic,
            mode=request.mode,
            rounds=request.rounds,
            llms=request.llms,
        )
        state = BattleState(config=config)
        self._battles[state.id] = state
        return state

    def get_battle(self, battle_id: str) -> BattleState | None:
        """Get battle state by ID"""
        return self._battles.get(battle_id)

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
        except Exception as e:
            state.status = BattleStatus.ERROR
            state.error_message = str(e)

        return state

    async def run_battle_streaming(
        self,
        battle_id: str,
    ) -> AsyncGenerator[BattleMessage, None]:
        """Run battle and yield messages as they're generated"""
        state = self._battles.get(battle_id)
        if not state:
            raise ValueError(f"Battle not found: {battle_id}")

        state.status = BattleStatus.IN_PROGRESS

        try:
            for round_num in range(1, state.config.rounds + 1):
                state.current_round = round_num

                for llm_config in state.config.llms:
                    response = await self._llm_service.generate_response(
                        provider=llm_config.provider,
                        persona=llm_config.persona,
                        topic=state.config.topic,
                        mode=state.config.mode,
                        conversation_history=state.messages,
                        current_round=round_num,
                    )

                    message = BattleMessage(
                        provider=llm_config.provider,
                        name=llm_config.name,
                        content=response,
                        round_number=round_num,
                    )
                    state.messages.append(message)
                    yield message

                    # Add delay between messages so users can read them
                    await asyncio.sleep(2.0)

            state.status = BattleStatus.COMPLETED
        except Exception as e:
            state.status = BattleStatus.ERROR
            state.error_message = str(e)
            raise

    async def _run_round(self, state: BattleState, round_num: int) -> None:
        """Run a single round - each LLM responds once"""
        for llm_config in state.config.llms:
            response = await self._llm_service.generate_response(
                provider=llm_config.provider,
                persona=llm_config.persona,
                topic=state.config.topic,
                mode=state.config.mode,
                conversation_history=state.messages,
                current_round=round_num,
            )

            message = BattleMessage(
                provider=llm_config.provider,
                name=llm_config.name,
                content=response,
                round_number=round_num,
            )
            state.messages.append(message)

    def get_all_battles(self) -> list[BattleResponse]:
        """Get all battles as responses"""
        return [self.get_battle_response(state) for state in self._battles.values()]

    def clear_battles(self) -> None:
        """Clear all battles (for testing)"""
        self._battles.clear()
