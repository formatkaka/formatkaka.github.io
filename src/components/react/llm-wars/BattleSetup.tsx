import { useState } from 'react';
import { LLMCard } from './LLMCard';
import { CURATED_TOPICS, LLM_PROVIDERS, PRESET_PERSONAS } from './types';
import { ToggleButtonGroup } from './components/ToggleButtonGroup';

import type { BattleMode, Language, LLMConfig } from './types';

type BattleSetupProps = {
  onStartBattle: (
    topic: string,
    mode: BattleMode,
    language: Language,
    rounds: number,
    llms: LLMConfig[]
  ) => void;
  isLoading: boolean;
};

const DEFAULT_PERSONAS: Record<string, string> = {
  openai: PRESET_PERSONAS[0].description,
  claude: PRESET_PERSONAS[1].description,
  grok: PRESET_PERSONAS[2].description,
};

export function BattleSetup(props: BattleSetupProps) {
  const { onStartBattle, isLoading } = props;

  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<BattleMode>('text');
  const [language, setLanguage] = useState<Language>('en');
  const [rounds, setRounds] = useState('3');
  const [personas, setPersonas] = useState<Record<string, string>>(DEFAULT_PERSONAS);

  const handlePersonaChange = (provider: string, persona: string) => {
    setPersonas((prev) => ({ ...prev, [provider]: persona }));
  };

  const handleSubmit = () => {
    if (!topic.trim()) {
      console.warn('Topic is empty, cannot start battle');
      return;
    }

    const llms: LLMConfig[] = LLM_PROVIDERS.map((provider) => ({
      provider,
      persona: personas[provider] || DEFAULT_PERSONAS[provider],
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
    }));

    console.log('Starting battle with config:', { topic, mode, language, rounds, llms });
    onStartBattle(topic, mode, language, parseInt(rounds, 10), llms);
  };

  const handleSurpriseMe = () => {
    const topicEntry = CURATED_TOPICS[Math.floor(Math.random() * CURATED_TOPICS.length)];

    const shuffled = [...topicEntry.characters].sort(() => Math.random() - 0.5);

    const newPersonas: Record<string, string> = {};
    LLM_PROVIDERS.forEach((provider, i) => {
      const character = PRESET_PERSONAS.find((p) => p.id === shuffled[i]);
      if (character) {
        newPersonas[provider] = character.description;
      }
    });

    setTopic(topicEntry.topic);
    setPersonas(newPersonas);
  };

  const isValid = topic.trim().length > 0;

  return (
    <div className="space-y-6 sm:space-y-5">
      <p className="px-1 text-[17px] leading-snug text-[#4d5964] sm:hidden">
        Watch 3 AI models debate any topic with custom personas
      </p>

      <div className="rounded-xl border border-[#c7e3f1] bg-white p-4 shadow-sm sm:border-[#eee1d6] sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-0 sm:flex-1">
          <label className="text-sm font-bold uppercase tracking-wide text-[#17313b]" htmlFor="battle-topic">Battle topic</label>
          <button
            onClick={handleSurpriseMe}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-[#07539b] transition hover:text-[#0b3d76] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5] focus-visible:ring-offset-2 sm:hidden"
            type="button"
          >
            <span aria-hidden="true">✦</span>
            Surprise Me
          </button>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="hidden min-h-11 items-center justify-center gap-2 rounded-lg border border-[#f6ad7b] bg-white px-4 py-2.5 text-sm font-semibold text-[#1b2021] transition hover:border-[#e8946a] hover:bg-[#fff8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b] focus-visible:ring-offset-2 sm:inline-flex"
          type="button"
        >
          <span>✨</span>
          <span>Surprise Me</span>
        </button>
        <textarea
          id="battle-topic"
          name="battle-topic"
          placeholder="e.g., Who would win: a trillion lions or the sun?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="block w-full resize-none border-0 bg-transparent p-0 text-[17px] leading-relaxed text-[#1b2021] placeholder:text-[#42515d] focus-visible:outline-none sm:max-w-[880px] sm:rounded-lg sm:border sm:border-[#d8d0c5] sm:bg-white sm:px-4 sm:py-3 sm:shadow-sm sm:focus-visible:border-[#f6ad7b] sm:focus-visible:ring-2 sm:focus-visible:ring-[#f6ad7b]/20"
          rows={2}
        />
      </div>

      {/* Fighters Section */}
      <div className="space-y-2.5">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-[#17313b]">Choose personas</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {LLM_PROVIDERS.map((provider) => (
            <LLMCard
              key={provider}
              provider={provider}
              persona={personas[provider]}
              onPersonaChange={(persona) => handlePersonaChange(provider, persona)}
            />
          ))}
        </div>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#c7e3f1] bg-white px-4 py-4 shadow-sm sm:grid-cols-3 sm:gap-4 sm:rounded-lg sm:border-[#eee] sm:bg-[#fafafa] sm:px-5">
        <ToggleButtonGroup
          label="Mode"
          options={[
            { value: 'text', label: 'Text' },
            { value: 'emoji', label: 'Emoji' },
          ]}
          value={mode}
          onChange={(value) => setMode(value as BattleMode)}
        />

        <ToggleButtonGroup
          label="Language"
          options={[
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'हिंदी' },
          ]}
          value={language}
          onChange={(value) => setLanguage(value as Language)}
        />

        <ToggleButtonGroup
          label="Rounds"
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
          value={rounds}
          onChange={setRounds}
        />
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="min-h-14 w-full rounded-xl border-0 bg-[#e77943] px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-[#d96831] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e77943] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c7cad6] disabled:text-[#263842] disabled:shadow-none sm:min-h-12 sm:rounded-lg sm:bg-[#f6ad7b] sm:hover:bg-[#e8946a]"
        type="button"
      >
        {isLoading ? 'Starting...' : 'Start Battle'}
      </button>
    </div>
  );
}
