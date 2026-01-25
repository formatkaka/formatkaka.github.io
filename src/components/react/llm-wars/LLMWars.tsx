import { useState } from 'react';
import { BattleSetup } from './BattleSetup';
import { BattleArena } from './BattleArena';
import { createBattle, streamBattle } from './api';
import { generateBattleTitle } from './types';

import type { BattleMode, Language, BattleMessage, BattleStatus, LLMConfig } from './types';

type BattleState = {
  id: string;
  topic: string;
  title: string;
  messages: BattleMessage[];
  currentRound: number;
  totalRounds: number;
  status: BattleStatus;
  errorMessage: string | null;
  llms: LLMConfig[];
};

export function LLMWars() {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartBattle = async (
    topic: string,
    mode: BattleMode,
    language: Language,
    rounds: number,
    llms: LLMConfig[]
  ) => {
    setIsLoading(true);

    try {
      const response = await createBattle(topic, mode, language, rounds, llms);

      setBattle({
        id: response.id,
        topic,
        title: generateBattleTitle(topic),
        messages: [],
        currentRound: 1,
        totalRounds: rounds,
        status: 'in_progress',
        errorMessage: null,
        llms,
      });

      streamBattle(
        response.id,
        (message) => {
          setBattle((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, message],
              currentRound: message.round_number,
            };
          });
        },
        () => {
          setBattle((prev) => {
            if (!prev) return prev;
            return { ...prev, status: 'completed' };
          });
        },
        (error) => {
          setBattle((prev) => {
            if (!prev) return prev;
            return { ...prev, status: 'error', errorMessage: error };
          });
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start battle';
      setBattle((prev) =>
        prev ? { ...prev, status: 'error', errorMessage: message } : null
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBattle(null);
  };

  return (
    <div className="llm-wars">
      <header className="header">
        <h1 className="title">LLM Wars</h1>
        <p className="subtitle">Watch 3 AI models debate any topic with custom personas</p>
      </header>

      <main className="main-content">
        {!battle ? (
          <BattleSetup onStartBattle={handleStartBattle} isLoading={isLoading} />
        ) : (
          <BattleArena
            topic={battle.topic}
            title={battle.title}
            messages={battle.messages}
            currentRound={battle.currentRound}
            totalRounds={battle.totalRounds}
            status={battle.status}
            errorMessage={battle.errorMessage}
            llms={battle.llms}
            onReset={handleReset}
          />
        )}
      </main>

      <style>{`
        .llm-wars {
          font-family: 'Source Sans Pro', sans-serif;
          color: #1b2021;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          text-decoration: underline;
          text-decoration-color: #f6ad7b;
          text-underline-offset: 4px;
        }
        
        .subtitle {
          font-size: 1.125rem;
          color: #555;
          margin: 0;
        }
        
        .main-content {
          background: #f2eee5;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        @media (max-width: 640px) {
          .title {
            font-size: 2rem;
          }
          
          .main-content {
            padding: 1.25rem;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
}
