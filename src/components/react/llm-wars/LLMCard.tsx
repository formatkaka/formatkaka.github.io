import { useEffect, useState } from 'react';
import { LLM_COLORS, LLM_LABELS, PRESET_PERSONAS, CUSTOM_PERSONA_ID } from './types';

import type { LLMProvider } from './types';

type LLMCardProps = {
  provider: LLMProvider;
  persona: string;
  onPersonaChange: (persona: string) => void;
};

export function LLMCard(props: LLMCardProps) {
  const { provider, persona, onPersonaChange } = props;

  const color = LLM_COLORS[provider];
  const label = LLM_LABELS[provider];

  // Find if the current persona matches a preset
  const currentPreset = PRESET_PERSONAS.find((p) => p.description === persona);
  
  const [selectedPreset, setSelectedPreset] = useState(
    currentPreset?.id || CUSTOM_PERSONA_ID
  );
  const [customPersona, setCustomPersona] = useState(
    currentPreset ? '' : persona
  );

  // Sync state when persona prop changes from parent (e.g., Surprise Me!)
  useEffect(() => {
    const matchingPreset = PRESET_PERSONAS.find((p) => p.description === persona);
    if (matchingPreset) {
      setSelectedPreset(matchingPreset.id);
      setCustomPersona('');
    } else {
      setSelectedPreset(CUSTOM_PERSONA_ID);
      setCustomPersona(persona);
    }
  }, [persona]);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);

    if (presetId === CUSTOM_PERSONA_ID) {
      onPersonaChange(customPersona);
    } else {
      const preset = PRESET_PERSONAS.find((p) => p.id === presetId);
      if (preset) {
        onPersonaChange(preset.description);
      }
    }
  };

  const handleCustomChange = (value: string) => {
    setCustomPersona(value);
    if (selectedPreset === CUSTOM_PERSONA_ID) {
      onPersonaChange(value);
    }
  };

  return (
    <div className="rounded-lg border border-[#eee] bg-white px-3 py-3 text-center shadow-sm transition hover:border-[#f6ad7b] hover:shadow-md">
      {/* Avatar */}
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: color }}>
        {provider.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="mb-2 text-[13px] font-semibold text-[#1b2021]">{label}</div>

      {/* Persona Selector */}
      <div className="mb-2">
        <select
          className="w-full rounded-md border border-[#e5e5e5] bg-[#f8f8f8] px-2 py-2 text-xs text-[#1b2021] transition hover:border-[#d0d0d0]"
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          {PRESET_PERSONAS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
          <option value={CUSTOM_PERSONA_ID}>Custom</option>
        </select>
      </div>

      {selectedPreset === CUSTOM_PERSONA_ID ? (
        <textarea
          placeholder="Describe the persona..."
          value={customPersona}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-2 py-2 text-xs text-[#1b2021] transition focus:border-[#f6ad7b] focus:outline-none"
          rows={2}
        />
      ) : (
        <p className="mt-1 line-clamp-2 text-[11px] text-[#888]">
          {PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.description}
        </p>
      )}
    </div>
  );
}
