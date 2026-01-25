"""
Surprise Service - LLM-driven random battle configuration generator
"""

import json
from pathlib import Path

from openai import OpenAI

from ..config import get_settings
from ..models.battle import LLMProvider


def _load_personas() -> str:
    """Load personas from shared JSON file and format for prompt."""
    personas_path = Path(__file__).parent.parent.parent / "shared" / "personas.json"
    
    try:
        with open(personas_path) as f:
            personas = json.load(f)
        
        lines = []
        for p in personas:
            lines.append(f" - {p['label']}: {p['description']}")
        return "\n".join(lines)
    except Exception:
        return " - (Could not load personas)"


def _load_pre_vetted_battles() -> str:
    battles_path = Path(__file__).parent.parent.parent / "shared" / "pre_vetted_battles.json"
    
    try:
        with open(battles_path) as f:
            battles = json.load(f)

        lines = []
        for b in battles:
            lines.append(
                f'- Topic: "{b["topic"]}"\n'
                f'  - OpenAI: {b["personas"]["openai"]}\n'
                f'  - Claude: {b["personas"]["claude"]}\n'
                f'  - Grok: {b["personas"]["grok"]}'
            )
        return "\n".join(lines)
    except Exception:
        return "(Could not load pre-vetted battles)"


SURPRISE_PROMPT_TEMPLATE = """You are the creative director for "LLM Wars" — a fun debate show where 3 AI models argue intensely about extremely simple things.

Your job: Generate ONE battle configuration with:
1. A SHORT, SIMPLE, everyday debate topic
2. THREE distinct personas that will overreact to it

────────────────────────
TOPIC RULES (VERY IMPORTANT)
────────────────────────
- The topic MUST be a short, plain sentence people hear in daily life.
- The topic should feel boring, obvious, unnecessary, or stupid to debate.
- The humor comes from TAKING A SMALL THING TOO SERIOUSLY.

GOOD TOPICS:
- "1+1 = 3"
- "Is water wet?"
- "Hi"
- "WiFi is slow"
- "I'll do it later"
- "Okay"
- "Monday is the worst day"

BAD TOPICS (DO NOT USE):
- Fantasy, animals, imaginary objects
- Sentient objects or magical creatures
- Abstract philosophy or metaphors
- Long or complex sentences
- Anything involving unicorns, penguins, dragons, socks, chairs, time paradoxes

If the topic sounds creative, poetic, or imaginative — it is WRONG.
The topic should look dumb at first glance.

────────────────────────
PERSONA RULES
────────────────────────
You must create exactly 3 personas:

Persona 1 (OpenAI) – MISCHIEVOUS  
- Angry, chaotic, provocative, overconfident
- Loves bad takes and stirring conflict

Persona 2 (Claude) – POLITE  
- Extremely calm, respectful, diplomatic
- Tries to keep peace no matter how silly the topic

Persona 3 (Grok) – WILDCARD  
- ANYTHING, but preferably mundane or unrelated
- Boring jobs, historical figures, random personalities work best
- Must NOT be an animal or mythical creature

────────────────────────
PERSONA CONSTRAINTS
────────────────────────
- Each persona description: 5–10 words only
- Simple language, easy to understand
- At least ONE persona should be clearly unrelated to the topic
- Avoid cute, whimsical, or "try-hard funny" personas

BAD PERSONAS (DO NOT USE):
- Anxious animals
- Whimsical fairies
- Sentient objects
- Overly poetic descriptions
- Anything that feels like a children's cartoon

GOOD PERSONAS:
- "Angry startup founder"
- "Overly polite HR manager"
- "Tired Roman general"
- "Passive aggressive roommate"
- "Customer support executive"

────────────────────────
FINAL OUTPUT FORMAT
────────────────────────
Respond with ONLY valid JSON in this exact format:

{{
  "topic": "Your short, boring debate topic",
  "personas": {{
    "openai": "Mischievous persona (5–10 words)",
    "claude": "Polite persona (5–10 words)",
    "grok": "Wildcard persona (5–10 words)"
  }}
}}

────────────────────────
PRE-VETTED EXAMPLES (STYLE REFERENCE)
────────────────────────
Below are APPROVED examples that perfectly match the desired style.
You must generate something in the SAME STYLE, but NOT copy them exactly.

{pre_vetted_battles}

────────────────────────
PRE-VETTED PERSONAS (STYLE REFERENCE)
────────────────────────
Below are APPROVED examples that perfectly match the desired style.
You must generate something in the SAME STYLE, but NOT copy them exactly.

{personas}

"""

class SurpriseService:
    """Service for generating random battle configurations using LLM."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = OpenAI(api_key=settings.openai_api_key)
        # Build prompt once at init with personas loaded from shared JSON
        self._prompt = SURPRISE_PROMPT_TEMPLATE.format(
            personas=_load_personas(), 
            pre_vetted_battles=_load_pre_vetted_battles()
        )

    async def _generate_config(self) -> str:
        """Generate a battle configuration via LLM call."""
        response = self._client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": self._prompt},
                {"role": "user", "content": "Generate a fresh, creative battle configuration. Be inventive!"},
            ],
            max_tokens=300,
            temperature=1.0,  # High creativity
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"
        
        # Return the raw JSON string - Agent Control will evaluate this
        return content

    def _format_response(self, json_str: str) -> dict:
        """Format the LLM response into the expected API response format."""
        try:
            result = json.loads(json_str)
        except json.JSONDecodeError:
            result = {
                "topic": "Is a taco a sandwich?",
                "personas": {
                    "openai": "Aggressive food critic",
                    "claude": "Zen Buddhist peace mediator", 
                    "grok": "Confused medieval peasant",
                }
            }
        
        topic = result.get("topic", "Is water wet?")
        personas = result.get("personas", {})
        
        return {
            "topic": topic,
            "personas": [
                {
                    "provider": LLMProvider.OPENAI.value,
                    "persona": personas.get("openai", "A mischievous troublemaker"),
                    "name": "OpenAI",
                },
                {
                    "provider": LLMProvider.CLAUDE.value,
                    "persona": personas.get("claude", "An overly polite diplomat"),
                    "name": "Claude",
                },
                {
                    "provider": LLMProvider.GROK.value,
                    "persona": personas.get("grok", "A confused time traveler"),
                    "name": "Grok",
                },
            ],
        }

    async def generate_surprise(self) -> dict:
        """Generate a random battle configuration."""
        print("🎲 Generating surprise config...")
        json_str = await self._generate_config()
        print("   ✅ Config generated!")
        return self._format_response(json_str)
