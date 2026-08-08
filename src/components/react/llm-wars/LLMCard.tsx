import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const selectedLabel = PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.label || 'Custom persona';

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
    <>
    <div className="relative flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm dark:bg-[#191f2b] dark:shadow-black/20 sm:hidden">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: color }}>
        {provider.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="truncate text-lg font-semibold text-[#172238] dark:text-[#f0f2f6]">{selectedLabel}</div>
          <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#9196a0] dark:text-[#929aaa]" strokeWidth={2.25} />
        </div>
        <div className="mt-0.5 text-xs text-[#8b909b] dark:text-[#9da5b3]">{label}</div>
      </div>
      <select aria-label={`${label} persona`} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)}>
        {PRESET_PERSONAS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        <option value={CUSTOM_PERSONA_ID}>Custom</option>
      </select>
    </div>
    <div className="hidden sm:block sm:min-h-56 sm:rounded-3xl sm:bg-white sm:px-7 sm:py-7 sm:text-center sm:dark:bg-[#191f2b]">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white sm:mx-auto sm:mb-5 sm:h-16 sm:w-16" style={{ backgroundColor: color }}>
        {provider.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="min-w-0 text-base font-semibold text-[#1b2021] dark:text-[#f0f2f6] sm:mb-3 sm:text-sm">{label}</div>
      <select
        aria-label={`${label} persona`}
        className="min-h-11 min-w-0 rounded-md border border-[#c7e3f1] bg-[#f4fbff] px-2 py-2 text-base text-[#1b2021] transition hover:border-[#8dc7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40 dark:border-[#363e4d] dark:bg-[#111620] dark:text-[#edf0f5] dark:hover:border-[#526078] sm:min-h-12 sm:w-full sm:border-[#e2e5ed] sm:bg-white sm:px-4 sm:text-base sm:dark:bg-[#111620]"
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
          className="col-span-full mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-2 py-2 text-xs text-[#1b2021] transition focus-visible:border-[#f6ad7b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b]/20 dark:border-[#363e4d] dark:bg-[#111620] dark:text-[#edf0f5]"
          rows={2}
        />
      ) : (
        <p className="col-span-full mt-1 hidden line-clamp-2 text-[11px] text-[#888] dark:text-[#9da5b3] sm:block">
          {PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.description}
        </p>
      )}
    </div>
    </>
  );
}
