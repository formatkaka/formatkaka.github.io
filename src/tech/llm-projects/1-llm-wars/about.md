# About LLM Wars

LLM Wars is an interactive comedy debate experience in which three large language models argue about an everyday prompt while adopting deliberately mismatched personalities. It is designed to make differences in model behaviour, tone, and improvisation visible through a playful, watchable format rather than through a conventional benchmark.

For example, a battle might ask whether water is wet and assign one model the role of a sarcastic scientist, another a zen master, and another a pigeon. Each participant is asked to stay in character, react to the previous responses, and keep its contribution short and entertaining.

## The Product Experience

A player chooses, or generates, a battle setup containing:

- A discussion topic.
- Three LLM participants: OpenAI, Claude, and Grok.
- A persona for each participant.
- A text or emoji-only response mode.
- English or Hindi output.
- One to ten rounds of debate; three is the default.

The application runs the participants in turn. Every participant sees the previous messages in the battle, then produces a new response from its assigned point of view. A completed battle is a chronological transcript with the speaker, provider, and round number attached to each message.

Players can also use the surprise configuration feature. It uses an LLM to create a short, low-stakes debate topic and a contrasting personality for each provider, making it easy to start a new battle without manually configuring one.

After a battle, viewers can vote for OpenAI, Claude, or Grok. When a database is configured, these votes and completed battle records can be persisted.

## Why It Exists

LLM Wars treats models as performers rather than interchangeable text generators. The same topic and high-level instruction are given a shared stage, while different models and personas shape the result. This makes the product useful for:

- Exploring how providers differ in style, humour, and instruction-following.
- Creating a lightweight, social way to demonstrate generative AI.
- Experimenting with prompt design, personas, languages, and constrained output modes.
- Collecting an audience preference signal through voting.

It is entertainment first, not a scientific evaluation or an objective model ranking. Votes indicate which response a viewer preferred in a particular playful context; they should not be interpreted as a general measure of model quality.

## Architecture

The public frontend is intended to be an Astro site hosted on GitHub Pages. It calls this FastAPI service, which coordinates the model APIs and returns battle state to the client.

```text
Astro frontend
    |
    | HTTPS requests / Server-Sent Events
    v
LLM Wars FastAPI API
    |
    +--> OpenAI API
    +--> Anthropic API (Claude)
    +--> xAI API (Grok)
    |
    +--> Optional PostgreSQL database for completed battles and votes
```

The backend exposes endpoints to create a battle, run it synchronously or in the background, stream messages with Server-Sent Events, retrieve the current result, generate a surprise setup, and record or retrieve votes. Galileo tracing is included for observability of LLM calls when it is configured.

## Core Behaviour

The battle prompt emphasizes a few rules:

- Participants should remain inside their assigned persona and knowledge "world."
- Responses should be one or two punchy sentences.
- Later turns should react to other speakers and avoid repeating earlier jokes.
- The final round should be a deliberately exaggerated closing statement.

The product includes a shared collection of predefined personas and topics. These provide ready-made combinations such as historical characters, professionals, internet archetypes, and absurd conversational roles, while the surprise generator creates new variations.

## Operational Requirements

The API needs credentials for the providers used by a battle:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROK_API_KEY`

`DATABASE_URL` is optional and enables PostgreSQL persistence. The service is configured for deployment on Railway or Render and can be run locally with Uvicorn.

## Scope

LLM Wars is a creative, experimental product. It does not present generated content as factual advice, and its personalities may produce fictional claims for comedic effect. The frontend should make that playful context clear and offer an accessible way for users to start, follow, and vote on a battle.
