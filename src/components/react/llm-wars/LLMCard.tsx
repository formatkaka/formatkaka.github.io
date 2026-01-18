import { useState, useEffect } from 'react';
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
  const [isSelectOpen, setIsSelectOpen] = useState(false);

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
    setIsSelectOpen(false);

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

  // Derive display label from current state
  const displayLabel = selectedPreset === CUSTOM_PERSONA_ID 
    ? 'Custom' 
    : PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.label || 'Custom';

  return (
    <div className="llm-card">
      {/* Avatar */}
      <div className="avatar" style={{ backgroundColor: color }}>
        {provider.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="name">{label}</div>

      {/* Persona Selector */}
      <div className="persona-select">
        <button 
          className="select-trigger"
          onClick={() => setIsSelectOpen(!isSelectOpen)}
          type="button"
        >
          <span className="select-value">{displayLabel}</span>
          <span className="select-arrow">{isSelectOpen ? '▲' : '▼'}</span>
        </button>
        
        {isSelectOpen && (
          <div className="select-dropdown">
            {PRESET_PERSONAS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`select-option ${selectedPreset === preset.id ? 'active' : ''}`}
                type="button"
              >
                <span className="option-label">{preset.label}</span>
              </button>
            ))}
            <button
              onClick={() => handlePresetChange(CUSTOM_PERSONA_ID)}
              className={`select-option ${selectedPreset === CUSTOM_PERSONA_ID ? 'active' : ''}`}
              type="button"
            >
              <span className="option-label">✏️ Custom</span>
            </button>
          </div>
        )}
      </div>

      {selectedPreset === CUSTOM_PERSONA_ID ? (
        <textarea
          placeholder="Describe the persona..."
          value={customPersona}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="custom-input"
          rows={2}
        />
      ) : (
        <p className="persona-desc">
          {PRESET_PERSONAS.find((p) => p.id === selectedPreset)?.description}
        </p>
      )}

      <style>{`
        .llm-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.2s;
        }
        
        .llm-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        
        .name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1b2021;
          margin-bottom: 0.75rem;
        }
        
        .persona-select {
          position: relative;
          margin-bottom: 0.5rem;
        }
        
        .select-trigger {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: #f8f8f8;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.8125rem;
          color: #1b2021;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.2s;
        }
        
        .select-trigger:hover {
          border-color: #ccc;
        }
        
        .select-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .select-arrow {
          font-size: 0.625rem;
          color: #888;
          margin-left: 0.5rem;
        }
        
        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-top: 0.25rem;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .select-option {
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 0.8125rem;
          color: #555;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        
        .select-option:hover {
          background: #f8f8f8;
        }
        
        .select-option.active {
          background: #fff5ef;
          color: #1b2021;
          font-weight: 500;
        }
        
        .option-label {
          display: block;
        }
        
        .custom-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.75rem;
          color: #1b2021;
          resize: none;
          margin-top: 0.25rem;
        }
        
        .custom-input:focus {
          outline: none;
          border-color: #f6ad7b;
        }
        
        .persona-desc {
          font-size: 0.75rem;
          color: #888;
          margin: 0.25rem 0 0;
          line-height: 1.4;
        }
        
        /* Scrollbar */
        .select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        
        .select-dropdown::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .select-dropdown::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
