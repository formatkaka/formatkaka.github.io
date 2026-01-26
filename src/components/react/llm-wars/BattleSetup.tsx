import { useState } from 'react';
import { LLMCard } from './LLMCard';
import { getSurpriseConfig } from './api';
import { LLM_PROVIDERS, PRESET_PERSONAS } from './types';
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
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);

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

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);
    
    try {
      const config = await getSurpriseConfig();
      
      setTopic(config.topic);
      
      const newPersonas: Record<string, string> = {};
      for (const p of config.personas) {
        newPersonas[p.provider] = p.persona;
      }
      setPersonas(newPersonas);
    } catch (error) {
      console.error('Failed to get surprise config:', error);
      // Fallback to a fun default
      setTopic("Is a hot dog a sandwich?");
      setPersonas({
        openai: "A chaotic gremlin who loves causing arguments",
        claude: "An overly polite British butler who apologizes constantly", 
        grok: "A philosophical pigeon contemplating urban existence",
      });
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  const isValid = topic.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-[#eee1d6] bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-[#1b2021]">Quick start</span>
          <span className="text-[15px] text-[#777]">Let the AIs pick a fun topic</span>
        </div>
        <button 
          onClick={handleSurpriseMe} 
          className={`inline-flex items-center gap-2 rounded-lg border border-[#f6ad7b] bg-white px-4 py-2.5 text-sm font-semibold text-[#1b2021] outline-none transition hover:bg-[#fff8f4] hover:border-[#e8946a] disabled:cursor-wait disabled:opacity-80 ${isSurpriseLoading ? 'animate-pulse' : ''}`}
          type="button"
          disabled={isSurpriseLoading}
        >
          <span>{isSurpriseLoading ? '⏳' : '✨'}</span>
          <span>{isSurpriseLoading ? 'Generating...' : 'Surprise Me'}</span>
        </button>
      </div>

      {/* Topic Section */}
      <div className="space-y-2.5">
        <label className="text-sm font-bold text-[#1b2021]">Battle topic</label>
        <textarea
          placeholder="e.g., Who would win: a trillion lions or the sun?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mx-auto block w-full max-w-[880px] rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-[16px] text-[#1b2021] shadow-sm transition focus:border-[#f6ad7b] focus:outline-none focus:ring-2 focus:ring-[#f6ad7b]/20"
          rows={2}
        />
      </div>

      {/* Fighters Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1b2021]">Choose personas</label>
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
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-[#eee] bg-[#fafafa] px-5 py-4 shadow-sm">
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
        className="w-full rounded-lg border-0 bg-[#f6ad7b] px-6 py-4 text-lg font-semibold text-white outline-none shadow-md transition hover:bg-[#e8946a] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#e0d8cf] disabled:text-[#9a9a9a] disabled:shadow-none"
        type="button"
      >
        {isLoading ? 'Starting...' : 'Start Battle'}
      </button>
    </div>
  );
}
