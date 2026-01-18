#!/usr/bin/env python3
"""
Quick script to test if config loads properly
"""

from src.config import get_settings

settings = get_settings()

print("=" * 50)
print("Testing Configuration Loading")
print("=" * 50)

print(f"\nOPENAI_API_KEY: ", end="")
if settings.openai_api_key:
    print(f"✅ Loaded ({settings.openai_api_key[:8]}...)")
else:
    print("❌ NOT FOUND")

print(f"ANTHROPIC_API_KEY: ", end="")
if settings.anthropic_api_key:
    print(f"✅ Loaded ({settings.anthropic_api_key[:8]}...)")
else:
    print("❌ NOT FOUND")

print(f"GROK_API_KEY: ", end="")
if settings.grok_api_key:
    print(f"✅ Loaded ({settings.grok_api_key[:8]}...)")
else:
    print("❌ NOT FOUND")

print("\n" + "=" * 50)

if not (settings.openai_api_key and settings.anthropic_api_key and settings.grok_api_key):
    print("\n⚠️  Some API keys are missing!")
    print("Make sure your .env file is in the project root with:")
    print("  OPENAI_API_KEY=sk-...")
    print("  ANTHROPIC_API_KEY=sk-ant-...")
    print("  GROK_API_KEY=xai-...")
else:
    print("\n✅ All API keys loaded successfully!")
