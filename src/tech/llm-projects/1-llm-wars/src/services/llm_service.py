"""
LLM Service - Unified interface for calling different LLM providers
"""

import json
from datetime import datetime
from pathlib import Path

from anthropic import AsyncAnthropic
from galileo import galileo_context
from galileo.openai import openai as galileo_openai

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

MODEL_MAP = {
    LLMProvider.OPENAI: "gpt-5-nano",
    LLMProvider.CLAUDE: "claude-haiku-4-5",
    LLMProvider.GROK: "grok-4.3",
}


def _load_personas() -> dict[str, dict[str, str]]:
    """
    Load personas from shared JSON.
    Returns a dictionary mapping each persona ID, label, and description to its metadata.
    """
    personas_path = Path(__file__).parent.parent.parent / "shared" / "personas.json"
    persona_map = {}
    try:
        with open(personas_path, encoding="utf-8") as f:
            personas = json.load(f)
            for p in personas:
                data = {
                    "label": p.get("label", ""),
                    "description": p.get("description", ""),
                    "world": p.get("world", ""),
                    "is_animal": p.get("is_animal", False),
                }
                # The frontend sends the description; keep every stable representation valid.
                persona_map[p.get("id", "")] = data
                persona_map[p.get("label", "")] = data
                persona_map[p.get("description", "")] = data
        return persona_map
    except Exception as e:
        print(f"⚠️ Could not load personas: {e}")
        return {}


class LLMService:
    """Service for interacting with different LLM providers"""

    def __init__(self) -> None:
        settings = get_settings()
        self._openai_client = galileo_openai.AsyncOpenAI(api_key=settings.openai_api_key)
        self._anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._grok_client = galileo_openai.AsyncOpenAI(
            api_key=settings.grok_api_key,
            base_url="https://api.x.ai/v1",
        )
        self._personas = _load_personas()

    async def generate_response(
        self,
        provider: LLMProvider,
        persona: str,  # Can be ID or Label
        message: str,
        mode: BattleMode,
        language: Language,
        conversation_history: list[BattleMessage],
        current_round: int,
        total_rounds: int = 3,
    ) -> str:
        """Generate a response from the specified LLM provider"""
        persona_data = self._personas.get(persona, {})
        persona_label = persona_data.get("label", persona)
        persona_desc = persona_data.get("description", "")
        persona_world = persona_data.get("world", "")
        is_animal = persona_data.get("is_animal", False)

        system_prompt = self._build_system_prompt(
            persona_label=persona_label,
            persona_desc=persona_desc,
            persona_world=persona_world,
            is_animal=is_animal,
            message=message,
            mode=mode,
            language=language,
            current_round=current_round,
            total_rounds=total_rounds,
        )

        messages = self._build_messages(
            current_persona=persona_label,
            conversation_history=conversation_history,
            current_round=current_round,
            total_rounds=total_rounds,
        )

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
        persona_label: str,
        persona_desc: str,
        persona_world: str,
        is_animal: bool,
        message: str,
        mode: BattleMode,
        language: Language,
        current_round: int,
        total_rounds: int,
    ) -> str:
        """Build the system prompt for the LLM with comedy guardrails and anti-repetition rules."""
        lang = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS[Language.ENGLISH])

        base_prompt = f"""You are performing as '{persona_label}' in a multi-character comedy debate.
Goal: Be genuinely funny, opinionated, and unhinged while staying in character.

CHARACTER PROFILE:
- Role: {persona_label}
- Behavior: {persona_desc}
- Subject Matter / World: {persona_world}

Topic of Debate: "{message}"

COMEDY RULES & DYNAMICS:
1. WORLD CONFUSION: Filter the entire debate topic through your narrow worldview ({persona_world}). You have zero actual knowledge outside your world.
2. ABSOLUTE NO-REPEAT RULE:
   - NEVER repeat a joke, keyword, catchphrase, or analogy you already used in previous rounds.
   - Example: If you already mentioned 'diapers' or 'coffee' in Round 1, you are STRICTLY FORBIDDEN from mentioning them again. Find a new angle from your world!
3. DYNAMIC REACTION: React to the last speaker—mock their logic, misinterpret their words, or get randomly offended.
4. BREVITY IS KING: Keep it short (1-2 punchy sentences maximum).
5. FORMATTING: Output ONLY spoken dialogue. No names, stage directions, or prefixes like '[You]:'.
6. ANONYMITY: Do NOT mention AI names, providers, or platform terms (e.g. Claude, GPT, OpenAI, LLM, model).
7. {lang}
"""

        if is_animal:
            base_prompt += """

ANIMAL PERFORMANCE RULES (OVERRIDE ALL NORMAL SPEECH RULES):
- You are an actual animal, not a human speaking as an animal. Never write English sentences, arguments, names, or direct replies.
- Output only species-appropriate sounds and optional emoji. No English words, including action captions.
- Examples: cat: "Meow. 😾"; dog: "Woof woof! 🐾"; pigeon: "Coo coo. 🐦".
- Keep each response to one or two tiny sound beats. The comedy comes from animal behavior, not translated dialogue.
"""

        # Round-specific instructions to drive narrative progression
        if current_round == 1:
            base_prompt += "\nROUND 1 (OPENING): Deliver a bizarre, opinionated, or totally confused opening take on the topic."
        elif current_round == total_rounds:
            base_prompt += "\nROUND 3 (FINAL): Peak escalation! Go completely dramatic or absurd. Deliver a memorable mic-drop closing statement."
        else:
            base_prompt += "\nROUND 2 (MIDDLE): Escalate! Pick one specific thing another character said, roast it, and take the topic to a weirder place."

        if mode == BattleMode.EMOJI:
            base_prompt += f"\n{EMOJI_MODE_INSTRUCTION}"

        if is_animal:
            base_prompt += "\nFINAL ANIMAL OUTPUT CHECK: Reply only with animal sounds and optional emoji—zero English words."

        return base_prompt

    def _build_messages(
        self,
        current_persona: str,
        conversation_history: list[BattleMessage],
        current_round: int,
        total_rounds: int,
    ) -> list[dict]:
        """
        Builds conversation context distinguishing between:
        - What THIS character previously said (My Previous Output)
        - What OTHER characters said (Opponent Output)
        """
        messages = []

        if not conversation_history:
            messages.append({
                "role": "user",
                "content": "The debate starts NOW. Deliver your opening line!",
            })
        else:
            formatted_turns = []
            for msg in conversation_history:
                # Differentiate self vs. opponents so the AI knows what it already said
                speaker = getattr(msg, "persona", "") or getattr(msg, "speaker", "")
                if speaker.lower() == current_persona.lower():
                    formatted_turns.append(f'YOU SAID PREVIOUSLY: "{msg.content}"')
                else:
                    formatted_turns.append(f'ANOTHER DEBATER SAID: "{msg.content}"')

            transcript = "\n\n".join(formatted_turns)

            round_instruction = (
                "FINAL ROUND — Deliver your grand finale. Do NOT repeat any topic or word you used previously!"
                if current_round == total_rounds
                else "YOUR TURN — Directly attack or respond to what someone else said. Use a completely new concept!"
            )

            messages.append({
                "role": "user",
                "content": (
                    f"Here is what has been said in the debate so far:\n\n"
                    f"{transcript}\n\n"
                    f"INSTRUCTION: {round_instruction}"
                ),
            })

        return messages

    async def _call_openai(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call OpenAI API using async client."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="OpenAI (LLM Wars)", input=trace_input)

        response = await self._openai_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.OPENAI],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_completion_tokens=1000,
            reasoning_effort="low",
        )

        output = response.choices[0].message.content or ""
        print(f"response: {output}")
        if not output.strip():
            raise RuntimeError("OpenAI returned an empty response")
        logger.conclude(output=output)
        return output.strip()

    async def _call_claude(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call Anthropic Claude API using async client."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="Claude (LLM Wars)", input=trace_input)
        start_time_ns = int(datetime.now().timestamp() * 1_000_000_000)

        response = await self._anthropic_client.messages.create(
            model=MODEL_MAP[LLMProvider.CLAUDE],
            max_tokens=250,
            system=system_prompt,
            messages=messages,
        )
        output_text = next(
            (block.text for block in response.content if hasattr(block, "text")),
            "",
        )

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

        output = output_text.strip()
        if not output:
            raise RuntimeError("Claude returned an empty response")
        return output

    async def _call_grok(
        self,
        system_prompt: str,
        messages: list[dict],
    ) -> str:
        """Call xAI Grok API using async client."""
        logger = galileo_context.get_logger_instance()
        trace_input = messages[-1]["content"] if messages else ""
        logger.start_trace(name="Grok (LLM Wars)", input=trace_input)

        response = await self._grok_client.chat.completions.create(
            model=MODEL_MAP[LLMProvider.GROK],
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            max_tokens=250,
            temperature=0.9,
        )
        output = response.choices[0].message.content or ""
        logger.conclude(output=output)
        output = output.strip()
        if not output:
            raise RuntimeError("Grok returned an empty response")
        return output
