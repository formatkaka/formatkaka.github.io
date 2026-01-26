import { useEffect, useState } from 'react';
import { BattleSetup } from './BattleSetup';
import { BattleArena } from './BattleArena';
import { PastBattles } from './PastBattles';
import { createBattle, streamBattle, getBattle, getBattleConfig } from './api';
import { generateBattleTitle } from './types';
import { saveBattleToIndexedDB } from './indexedDB';

import type { BattleMode, Language, BattleMessage, BattleStatus, LLMConfig, BattleConfig } from './types';

function createBattleState(
  id: string,
  config: BattleConfig,
  messages: BattleMessage[] = [],
  currentRound: number = 0,
  status: BattleStatus = 'pending',
  errorMessage: string | null = null
): BattleState {
  return {
    id,
    topic: config.topic,
    title: generateBattleTitle(config.topic),
    messages,
    currentRound,
    totalRounds: config.rounds,
    status,
    errorMessage,
    llms: config.llms,
  };
}

function clearBattleFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('battle');
  window.history.replaceState({}, '', url);
}

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
  const [sharedBattleId, setSharedBattleId] = useState<string | null>(null);
  const [sharedBattleConfig, setSharedBattleConfig] = useState<BattleConfig | null>(null);
  const [loadingShared, setLoadingShared] = useState(false);

  // Check for shared battle in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const battleId = params.get('battle');
    
    if (battleId && !battle) {
      // Only load if we don't already have a battle loaded
      setSharedBattleId(battleId);
      loadSharedBattleConfig(battleId);
    }
  }, []);

  const loadSharedBattleConfig = async (battleId: string) => {
    setLoadingShared(true);
    try {
      const config = await getBattleConfig(battleId);
      setSharedBattleConfig(config);
      setBattle(createBattleState(battleId, config));
    } catch (error) {
      console.error('Failed to load shared battle config:', error);
      setSharedBattleId(null);
      clearBattleFromUrl();
    } finally {
      setLoadingShared(false);
    }
  };

  const startBattleFromConfig = async (config: BattleConfig) => {
    setIsLoading(true);

    try {
      console.log('Creating battle with config:', config);
      const response = await createBattle(
        config.topic,
        config.mode,
        config.language,
        config.rounds,
        config.llms
      );

      console.log('Battle created, response:', response);
      const battleState = createBattleState(response.id, config, [], 1, 'in_progress');
      setBattle(battleState);

      console.log('Starting stream for battle:', response.id);
      streamBattle(
        response.id,
        (message) => {
          console.log('Received message:', message);
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
          console.log('Battle stream completed');
          setBattle((prev) => {
            if (!prev) return prev;
            // Save to IndexedDB when battle completes
            saveBattleToIndexedDB(
              prev.id,
              prev.topic,
              prev.title,
              'completed'
            );
            return { ...prev, status: 'completed' };
          });
        },
        (error) => {
          console.error('Battle stream error:', error);
          setBattle((prev) => {
            if (!prev) return prev;
            return { ...prev, status: 'error', errorMessage: error };
          });
        }
      );
    } catch (error) {
      console.error('Error starting battle:', error);
      const message = error instanceof Error ? error.message : 'Failed to start battle';
      alert(`Failed to start battle: ${message}`);
      // Don't set battle state on error - let user try again
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBattle = async (
    topic: string,
    mode: BattleMode,
    language: Language,
    rounds: number,
    llms: LLMConfig[]
  ) => {
    console.log('handleStartBattle called with:', { topic, mode, language, rounds, llms });
    try {
      await startBattleFromConfig({ topic, mode, language, rounds, llms });
    } catch (error) {
      console.error('Error in handleStartBattle:', error);
    }
  };

  const handleReset = () => {
    setBattle(null);
  };

  const handleLoadBattle = async (battleId: string) => {
    setIsLoading(true);
    try {
      const [battleResponse, config] = await Promise.all([
        getBattle(battleId),
        getBattleConfig(battleId),
      ]);
      
      setBattle(createBattleState(
        battleResponse.id,
        config,
        battleResponse.messages,
        battleResponse.current_round,
        battleResponse.status,
        battleResponse.error_message
      ));
      
      setSharedBattleId(null);
      setSharedBattleConfig(null);
      clearBattleFromUrl();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load battle';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSharedBattle = () => {
    if (sharedBattleConfig) {
      startBattleFromConfig(sharedBattleConfig);
      setSharedBattleId(null);
      setSharedBattleConfig(null);
      clearBattleFromUrl();
    }
  };

  return (
    <div className="font-['Source Sans Pro'] text-[#1b2021]">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 underline decoration-[#f6ad7b] underline-offset-4">
          LLM Wars
        </h1>
        <p className="text-lg text-[#555]">
          Watch 3 AI models debate any topic with custom personas
        </p>
      </header>

      <main className="bg-[#f2eee5] rounded-xl p-8 shadow-lg">
        {!battle ? (
          <>
            <BattleSetup onStartBattle={handleStartBattle} isLoading={isLoading} />
            <div className="mt-5">
              <PastBattles onLoadBattle={handleLoadBattle} />
            </div>
          </>
        ) : (
          <BattleArena
            battleId={battle.id}
            topic={battle.topic}
            title={battle.title}
            messages={battle.messages}
            currentRound={battle.currentRound}
            totalRounds={battle.totalRounds}
            status={battle.status}
            errorMessage={battle.errorMessage}
            llms={battle.llms}
            onReset={handleReset}
            showSharedOverlay={sharedBattleId !== null && sharedBattleConfig !== null && battle.messages.length === 0}
            sharedBattleConfig={sharedBattleConfig}
            onViewSharedBattle={handleViewSharedBattle}
            loadingShared={loadingShared}
          />
        )}
      </main>
    </div>
  );
}
