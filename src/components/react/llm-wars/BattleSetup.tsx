import { useState } from 'react';
import { LLMCard } from './LLMCard';
import { getSurpriseConfig } from './api';
import { LLM_PROVIDERS, PRESET_PERSONAS } from './types';

import type { BattleMode, LLMConfig } from './types';

type BattleSetupProps = {
  onStartBattle: (
    topic: string,
    mode: BattleMode,
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
  const [rounds, setRounds] = useState('3');
  const [personas, setPersonas] = useState<Record<string, string>>(DEFAULT_PERSONAS);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);

  const handlePersonaChange = (provider: string, persona: string) => {
    setPersonas((prev) => ({ ...prev, [provider]: persona }));
  };

  const handleSubmit = () => {
    if (!topic.trim()) return;

    const llms: LLMConfig[] = LLM_PROVIDERS.map((provider) => ({
      provider,
      persona: personas[provider] || DEFAULT_PERSONAS[provider],
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
    }));

    onStartBattle(topic, mode, parseInt(rounds, 10), llms);
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
    <div className="battle-setup">
      {/* Surprise Me Button */}
      <button 
        onClick={handleSurpriseMe} 
        className={`surprise-btn ${isSurpriseLoading ? 'loading' : ''}`}
        type="button"
        disabled={isSurpriseLoading}
      >
        <span className="surprise-icon">{isSurpriseLoading ? '⏳' : '✨'}</span>
        <span>{isSurpriseLoading ? 'Generating...' : 'Surprise Me!'}</span>
      </button>

      {/* Topic Section */}
      <div className="section">
        <label className="label">Battle Topic</label>
        <textarea
          placeholder="e.g., Who would win: a trillion lions or the sun?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="topic-input"
          rows={2}
        />
      </div>

      {/* Fighters Section */}
      <div className="section">
        <label className="label">Choose Personas</label>
        <div className="fighters-grid">
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
      <div className="settings-row">
        <div className="setting">
          <label className="label">Mode</label>
          <div className="toggle-group">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`toggle-btn ${mode === 'text' ? 'active' : ''}`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode('emoji')}
              className={`toggle-btn ${mode === 'emoji' ? 'active' : ''}`}
            >
              Emoji
            </button>
          </div>
        </div>

        <div className="setting">
          <label className="label">Rounds</label>
          <div className="toggle-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRounds(String(n))}
                className={`toggle-btn round-btn ${rounds === String(n) ? 'active' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={`start-btn ${!isValid || isLoading ? 'disabled' : ''}`}
        type="button"
      >
        {isLoading ? 'Starting...' : 'Start Battle'}
      </button>

      <style>{`
        .battle-setup {
          font-family: 'Source Sans Pro', sans-serif;
        }
        
        .section {
          margin-bottom: 1.5rem;
        }
        
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1b2021;
          margin-bottom: 0.5rem;
        }
        
        /* Surprise Button */
        .surprise-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: white;
          border: 2px dashed #f6ad7b;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          color: #1b2021;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .surprise-btn:hover:not(:disabled) {
          background: #fff8f4;
          border-color: #e8946a;
        }
        
        .surprise-btn:disabled {
          cursor: wait;
          opacity: 0.8;
        }
        
        .surprise-btn.loading {
          background: #fff8f4;
          border-style: solid;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .surprise-icon {
          font-size: 1.25rem;
        }
        
        /* Topic Input */
        .topic-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          color: #1b2021;
          resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
        }
        
        .topic-input:focus {
          outline: none;
          border-color: #f6ad7b;
          box-shadow: 0 0 0 3px rgba(246, 173, 123, 0.15);
        }
        
        .topic-input::placeholder {
          color: #999;
        }
        
        /* Fighters Grid */
        .fighters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        /* Settings Row */
        .settings-row {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .setting {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .toggle-group {
          display: flex;
          gap: 0.25rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.25rem;
        }
        
        .toggle-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.875rem;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          color: #1b2021;
        }
        
        .toggle-btn.active {
          background: #f6ad7b;
          color: white;
        }
        
        .round-btn {
          padding: 0.5rem 0.75rem;
          min-width: 2.5rem;
        }
        
        /* Start Button */
        .start-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: #1b2021;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .start-btn:hover:not(.disabled) {
          background: #333;
        }
        
        .start-btn.disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .fighters-grid {
            grid-template-columns: 1fr;
          }
          
          .settings-row {
            gap: 1rem;
          }
          
          .toggle-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}
