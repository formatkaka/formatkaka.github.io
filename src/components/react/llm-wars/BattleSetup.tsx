import { useState } from 'react';
import { LLMCard } from './LLMCard';
import { RotatingHeroHeading } from './AnimatedHeading';
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
    <div className="space-y-6 pt-1 sm:space-y-10 sm:pt-0">
      <div className="text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#4b4c57] dark:text-[#a9afbc] sm:mb-5 sm:text-xl sm:tracking-[0.35em]">YEL-LMS</p>
        <h1 className="min-h-[1.2em] whitespace-nowrap text-[clamp(1.125rem,5.7vw,3rem)] font-bold leading-tight tracking-tight text-[#11131a] dark:text-[#f4f5f8]">
          <RotatingHeroHeading />
        </h1>
      </div>

      <div className="sm:flex sm:items-center sm:gap-5">
        <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
          <label className="text-sm font-bold uppercase tracking-wide text-[#17313b] dark:text-[#d8dee9]" htmlFor="battle-topic">Battle topic</label>
          <button
            onClick={handleSurpriseMe}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#386de0] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285bc8] active:bg-[#214da8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0] focus-visible:ring-offset-2 sm:hidden"
            type="button"
          >
            <span aria-hidden="true">✦</span>
            Surprise Me
          </button>
        </div>
        <textarea
          id="battle-topic"
          name="battle-topic"
          placeholder="e.g., Who would win: a trillion lions or the sun?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="block min-h-[4.5rem] w-full resize-none rounded-xl border-0 bg-[#eaf0ff] px-4 py-3 text-[17px] leading-relaxed text-[#1b2021] placeholder:text-[#657181] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0]/30 dark:bg-[#1c2330] dark:text-[#f0f2f6] dark:placeholder:text-[#8d96a5] sm:flex-1 sm:px-5 sm:py-4 sm:text-base"
          rows={2}
        />
        <button
          onClick={handleSurpriseMe}
          className="hidden min-h-[4.5rem] items-center justify-center gap-2 rounded-xl bg-[#386de0] px-7 text-sm font-semibold text-white transition hover:bg-[#285bc8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0] focus-visible:ring-offset-2 sm:inline-flex"
          type="button"
        >
          <span aria-hidden="true">✦</span>
          <span>Surprise Me</span>
        </button>
      </div>

      {/* Fighters Section */}
      <div className="space-y-2.5 sm:space-y-0">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-[#17313b] dark:text-[#d8dee9]"><span className="sm:hidden">Combatants</span><span className="hidden sm:inline">Choose personas</span></h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-7">
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
      <div className="grid grid-cols-2 gap-5 rounded-xl border border-[#c7e3f1] bg-white px-4 py-4 shadow-sm dark:border-[#30394a] dark:bg-[#171c27] sm:mx-auto sm:flex sm:w-fit sm:items-center sm:gap-6 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:dark:bg-transparent">
        <ToggleButtonGroup
          className="sm:hidden"
          label="Rounds"
          options={[1, 3, 5].map((n) => ({ value: String(n), label: String(n) }))}
          value={rounds}
          onChange={setRounds}
        />

        <ToggleButtonGroup
          className="sm:hidden"
          label="Mode"
          options={[
            { value: 'text', label: 'Text' },
            { value: 'emoji', label: 'Emoji' },
          ]}
          value={mode}
          onChange={(value) => setMode(value as BattleMode)}
        />

        <ToggleButtonGroup
          className="hidden sm:flex"
          label="Rounds"
          options={[1, 2, 3].map((n) => ({ value: String(n), label: String(n) }))}
          value={rounds}
          onChange={setRounds}
        />

        <ToggleButtonGroup
          className="hidden sm:flex"
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
          className="hidden sm:flex"
        />
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="mx-auto block min-h-14 w-[19rem] max-w-full rounded-full border-0 bg-black px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-[#202020] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c7cad6] disabled:text-[#263842] disabled:shadow-none dark:bg-[#f1f3f7] dark:text-[#11151d] dark:hover:bg-white dark:focus-visible:ring-[#f1f3f7] dark:disabled:bg-[#353b48] dark:disabled:text-[#8e96a5] sm:min-h-16 sm:w-[23rem] sm:rounded-2xl sm:text-xl"
        type="button"
      >
        {isLoading ? 'Starting...' : 'Start Battle'}
      </button>
    </div>
  );
}
