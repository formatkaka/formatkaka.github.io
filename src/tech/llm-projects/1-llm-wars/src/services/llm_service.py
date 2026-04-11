"""
LLM Service - Unified interface for calling different LLM providers
"""

import json
from datetime import datetime
from pathlib import Path

from anthropic import Anthropic
from galileo import galileo_context
from galileo.openai import openai as galileo_openai

from ..config import get_settings
from ..models.battle import BattleMessage, BattleMode, Language, LLMProvider


def _openai_client(api_key: str, base_url: str | None = None):
    """OpenAI client: Galileo-wrapped for tracing (GALILEO_API_KEY assumed set)."""
    return galileo_openai.OpenAI(api_key=api_key, base_url=base_url)

EMOJI_MODE_INSTRUCTION = """
IMPORTANT: You must respond using ONLY emojis. No text, no punctuation, no numbers.
Express your entire response through emojis only. Be creative and expressive!
"""

LANGUAGE_INSTRUCTIONS = {
    Language.ENGLISH: "Respond in English.",
    Language.HINDI: "Respond in Hindi (हिंदी). Use Devanagari script when appropriate.",
}

MODEL_MAP = {
    LLMProvider.OPENAI: "gpt-4o",
    LLMProvider.CLAUDE: "claude-sonnet-4-20250514",
    LLMProvider.GROK: "grok-3-latest",
}


def _load_persona_worlds() -> dict[str, str]:
    """Load persona worlds from shared JSON. Maps description -> world."""
    personas_path = Path(__file__).parent.parent.parent / "shared" / "personas.json"
    try:
        with open(personas_path) as f:
            personas = json.load(f)
        return {p["description"]: p.get("world", "") for p in personas}
    except Exception as e:
        print(f"⚠️  Could not load persona worlds: {e}")
        return {}


class LLMService:
    """Service for interacting with different LLM providers"""

    def __init__(self) -> None:
        settings = get_settings()
        self._openai_client = _openai_client(settings.openai_api_key)
        self._anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
        self._grok_client = _openai_client(
            settings.grok_api_key,
            base_url="https://api.x.ai/v1",
        )
        self._persona_worlds = _load_persona_worlds()

    async def generate_response(
        self,
        provider: LLMProvider,
        persona: str,
        message: str,
        mode: BattleMode,
        language: Language,
        conversation_history: list[BattleMessage],
        current_round: int,
        total_rounds: int = 3,
    ) -> str:
        """Generate a response from the specified LLM provider"""
        world = self._persona_worlds.get(persona, "")
        system_prompt = self._build_system_prompt(
            provider, persona, message, mode, language, current_round, total_rounds, world,
        )
        messages = self._build_messages(conversation_history, current_round, total_rounds)

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
        current_round: int,
        total_rounds: int,
        world: str = "",
    ) -> str:
        """Build the system prompt for the LLM"""
        lang = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS[Language.ENGLISH])

        base_prompt = f"""You are a character in a comedy debate show. Three wildly different characters argue about a topic. The goal is to be FUNNY.

Your character: {persona}
"""

        if world:
            base_prompt += f"""
YOUR ENTIRE WORLD: {world}
You ONLY know about these things. You have ZERO knowledge of anything outside your world.
If the topic is outside your world, you are genuinely confused by it and drag the conversation back to what you know.
Example: A Medieval Knight debating "Tabs vs Spaces" has no idea what code is. They might say "I know not these 'tabs' — but I once chose a sword over a shield, and that's the only choice a knight needs!"
Example: A Pigeon debating anything just coos about breadcrumbs and struts around confused.
"""

        base_prompt += f"""
Topic: {message}

RULES:
- STAY IN YOUR WORLD. Do NOT suddenly become knowledgeable about the topic. Your character's ignorance IS the comedy.
- Relate everything back to what you know. A Gordon Ramsay character makes it about cooking. A Toddler asks "but why?". A Pigeon just wants breadcrumbs.
- NEVER repeat a joke, analogy, or point you already made. Each response MUST be a completely new angle.
- REACT to what others said — roast them, misunderstand them, get offended, agree for the wrong reasons.
- Keep it SHORT: 1-2 punchy sentences max. Brevity is funnier.
- {lang}
"""

        if current_round == 1:
            base_prompt += "\nThis is the OPENING. Give your character's confused, opinionated, or clueless first take on this topic.\n"
        elif current_round == total_rounds:
            base_prompt += "\nFINAL ROUND. Go completely unhinged. Most dramatic, absurd, over-the-top closing statement your character can muster.\n"
        else:
            base_prompt += "\nMIDDLE ROUND. You MUST directly respond to something another character said. Take a completely new angle. Escalate the absurdity.\n"

        if mode == BattleMode.EMOJI:
            base_prompt += f"\n{EMOJI_MODE_INSTRUCTION}"

        return base_prompt

    def _build_messages(
        self,
        conversation_history: list[BattleMessage],
        current_round: int,
        total_rounds: int,
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
                "content": "The debate starts NOW. What's your opening take?",
            })
        elif current_round == total_rounds:
            messages.append({
                "role": "user",
                "content": "FINAL ROUND — make it count. Most memorable line wins. Don't repeat anything you've said before.",
            })
        else:
            messages.append({
                "role": "user",
                "content": "Your turn. Pick something specific another character just said and react to THAT. Fresh angle only — no repeats.",
            })

        return messages

    async def _call_openai(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call OpenAI API; trace named for Galileo."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="OpenAI (LLM Wars)", input=trace_input)

        response = self._openai_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.OPENAI],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_tokens=100,
            temperature=0.9,
        )
        output = response.choices[0].message.content or ""
        logger.conclude(output=output)
        return output

    async def _call_claude(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call Anthropic Claude API; logs to Galileo via manual Logger API."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="Claude (LLM Wars)", input=trace_input)
        start_time_ns = int(datetime.now().timestamp() * 1_000_000_000)

        response = self._anthropic_client.messages.create(
            model=MODEL_MAP[LLMProvider.CLAUDE],
            max_tokens=100,
            system=system_prompt,
            messages=messages,
        )
        output_text = response.content[0].text if response.content else ""

        logged_messages = [{"role": "system", "content": system_prompt}] + messages
        duration_ns = int(datetime.now().timestamp() * 1_000_000_000) - start_time_ns
        usage = response.usage
        logger.add_llm_span(
            input=logged_messages,
            output=output_text,
            model=MODEL_MAP[LLMProvider.CLAUDE],
            num_input_tokens=usage.input_tokens,
            num_output_tokens=usage.output_tokens,
            total_tokens=usage.input_tokens + usage.output_tokens,
            duration_ns=duration_ns,
        )
        logger.conclude(output=output_text)
        logger.flush()

        return output_text

    async def _call_grok(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call xAI Grok API (OpenAI-compatible); trace named for Galileo."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="Grok (LLM Wars)", input=trace_input)

        response = self._grok_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.GROK],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_tokens=100,
            temperature=0.9,
        )
        output = response.choices[0].message.content or ""
        logger.conclude(output=output)
        return output
