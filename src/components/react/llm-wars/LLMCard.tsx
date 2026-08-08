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
    <div className="grid grid-cols-[2.5rem_5.5rem_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#c7e3f1] bg-white px-3 py-3 text-left shadow-sm transition hover:shadow-md sm:block sm:border-[#eee] sm:text-center sm:hover:border-[#f6ad7b]">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white sm:mx-auto sm:mb-2" style={{ backgroundColor: color }}>
        {provider.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="min-w-0 text-base font-semibold text-[#1b2021] sm:mb-2 sm:text-[13px]">{label}</div>
      <select
        aria-label={`${label} persona`}
        className="min-h-11 min-w-0 rounded-md border border-[#c7e3f1] bg-[#f4fbff] px-2 py-2 text-base text-[#1b2021] transition hover:border-[#8dc7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40 sm:w-full sm:text-xs"
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

      {selectedPreset === CUSTOM_PERSONA_ID ? (
        <textarea
          placeholder="Describe the persona..."
          aria-label={`${label} custom persona`}
          value={customPersona}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="col-span-full mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-2 py-2 text-xs text-[#1b2021] transition focus-visible:border-[#f6ad7b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b]/20"
          rows={2}
        />
      ) : (
        <p className="col-span-full mt-1 hidden line-clamp-2 text-[11px] text-[#888] sm:block">
          {PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.description}
        </p>
      )}
    </div>
  );
}
