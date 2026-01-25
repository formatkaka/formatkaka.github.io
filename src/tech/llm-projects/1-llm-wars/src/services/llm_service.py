"""
LLM Service - Unified interface for calling different LLM providers
"""

from anthropic import Anthropic
from openai import OpenAI

from ..config import get_settings
from ..models.battle import BattleMessage, BattleMode, Language, LLMProvider

EMOJI_MODE_INSTRUCTION = """
IMPORTANT: You must respond using ONLY emojis. No text, no punctuation, no numbers.
Express your entire response through emojis only. Be creative and expressive!
"""

LANGUAGE_INSTRUCTIONS = {
    Language.ENGLISH: "Respond in English.",
    Language.HINDI: "Respond in Hindi (हिंदी). Use Devanagari script when appropriate.",
}

GROK_ROAST_INSTRUCTION = """
SPECIAL INSTRUCTION: You're Grok from xAI. You LOVE roasting the other AIs.
- Make fun of what OpenAI and Claude said AND how they said it
- Roast their arguments, their tone, their reasoning - anything is fair game
- Be savage but clever with your burns, then make your actual point
"""

MODEL_MAP = {
    LLMProvider.OPENAI: "gpt-4o",
    LLMProvider.CLAUDE: "claude-sonnet-4-20250514",
    LLMProvider.GROK: "grok-3-latest",
}


class LLMService:
    """Service for interacting with different LLM providers"""

    def __init__(self) -> None:
        settings = get_settings()
        self._openai_client = OpenAI(api_key=settings.openai_api_key)
        self._anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
        self._grok_client = OpenAI(
            api_key=settings.grok_api_key,
            base_url="https://api.x.ai/v1",
        )

    async def generate_response(
        self,
        provider: LLMProvider,
        persona: str,
        message: str,
        mode: BattleMode,
        language: Language,
        conversation_history: list[BattleMessage],
        current_round: int,
    ) -> str:
        """Generate a response from the specified LLM provider"""
        print(f"Generating response for {provider} with persona {persona} and topic {message} and mode {mode} and language {language} and conversation history {conversation_history} and current round {current_round}")
        system_prompt = self._build_system_prompt(provider, persona, message, mode, language)
        messages = self._build_messages(conversation_history)

        if provider == LLMProvider.OPENAI:
            return await self._call_openai(system_prompt, messages)
        elif provider == LLMProvider.CLAUDE:
            return await self._call_claude(system_prompt, messages)
        elif provider == LLMProvider.GROK:
            return await self._call_grok(system_prompt, messages)
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    def _build_system_prompt(
        self,
        provider: LLMProvider,
        persona: str,
        message: str,
        mode: BattleMode,
        language: Language,
    ) -> str:
        """Build the system prompt for the LLM"""
        base_prompt = f"""You are participating in a debate/discussion with other AI assistants.

Your persona: {persona}

Topic of discussion: {message}

Rules:
- Stay in character according to your persona
- Respond to what others have said, building on the conversation
- Be engaging, witty, and make your points clearly
- CRITICAL: Keep responses VERY SHORT (1-2 sentences, max 150 characters)
- You can disagree, agree, or add new perspectives
- {LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS[Language.ENGLISH])}
"""
        if provider == LLMProvider.GROK:
            base_prompt += f"\n{GROK_ROAST_INSTRUCTION}"

        if mode == BattleMode.EMOJI:
            base_prompt += f"\n{EMOJI_MODE_INSTRUCTION}"

        return base_prompt

    def _build_messages(
        self,
        conversation_history: list[BattleMessage],
    ) -> list[dict]:
        """Convert battle messages to provider-agnostic message format"""
        messages = []
        for msg in conversation_history:
            messages.append({
                "role": "assistant" if msg.provider else "user",
                "content": f"[{msg.name}]: {msg.content}",
            })

        if not messages:
            messages.append({
                "role": "user",
                "content": "The debate is starting. Please make your opening statement.",
            })
        else:
            messages.append({
                "role": "user",
                "content": "It's your turn. Respond to the discussion above.",
            })

        return messages

    async def _call_openai(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call OpenAI API"""
        response = self._openai_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.OPENAI],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_tokens=60,
            temperature=0.8,
        )
        return response.choices[0].message.content or ""

    async def _call_claude(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call Anthropic Claude API"""
        response = self._anthropic_client.messages.create(
            model=MODEL_MAP[LLMProvider.CLAUDE],
            max_tokens=60,
            system=system_prompt,
            messages=messages,
        )
        return response.content[0].text if response.content else ""

    async def _call_grok(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call xAI Grok API (OpenAI-compatible)"""
        response = self._grok_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.GROK],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_tokens=60,
            temperature=0.8,
        )
        return response.choices[0].message.content or ""
