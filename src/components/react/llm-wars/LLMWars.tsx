import { useCallback, useEffect, useRef, useState } from 'react';
import { BattleSetup } from './BattleSetup';
import { BattleArena } from './BattleArena';
import { PastBattles } from './PastBattles';
import { createBattle, streamBattle, getBattle, getBattleConfig } from './api';
import { generateBattleTitle } from './types';
import { saveBattleToIndexedDB } from './indexedDB';
import { isOwnedBattleId, saveOwnedBattleId } from './battleOwnership';

import type { BattleMode, Language, BattleMessage, BattleStatus, LLMConfig, BattleConfig } from './types';

function createBattleState(
  id: string,
  config: BattleConfig,
  messages: BattleMessage[] = [],
  currentRound: number = 0,
  status: BattleStatus = 'pending',
  errorMessage: string | null = null,
  animateMessages: boolean = true
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
    animateMessages,
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
  animateMessages: boolean;
};

export function LLMWars() {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  const activeBattleIdRef = useRef<string | null>(null);
  const replayBattleIdRef = useRef<string | null>(null);
  const replayTimeoutRef = useRef<number | null>(null);

  const stopActiveStream = useCallback(() => {
    streamCleanupRef.current?.();
    streamCleanupRef.current = null;
    activeBattleIdRef.current = null;

    if (replayTimeoutRef.current !== null) {
      window.clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    replayBattleIdRef.current = null;
  }, []);

  useEffect(() => stopActiveStream, [stopActiveStream]);

  // Check for shared battle in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const battleId = params.get('battle');
    
    if (battleId && !battle) {
      loadSharedBattle(battleId);
    }
  }, []);

  const loadSharedBattle = async (battleId: string) => {
    try {
      const [battleResponse, config] = await Promise.all([
        getBattle(battleId),
        getBattleConfig(battleId),
      ]);

      if (isOwnedBattleId(battleResponse.id)) {
        setBattle(createBattleState(
          battleResponse.id,
          config,
          battleResponse.messages,
          battleResponse.current_round,
          battleResponse.status,
          battleResponse.error_message,
          false
        ));
        return;
      }

      setBattle(createBattleState(
        battleResponse.id,
        config,
        [],
        0,
        'in_progress'
      ));

      replayBattleIdRef.current = battleResponse.id;
      for (const message of battleResponse.messages) {
        if (replayBattleIdRef.current !== battleResponse.id) return;

        setBattle((prev) => {
          if (!prev || prev.id !== battleResponse.id) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message],
            currentRound: message.round_number,
          };
        });

        await new Promise<void>((resolve) => {
          replayTimeoutRef.current = window.setTimeout(() => {
            replayTimeoutRef.current = null;
            resolve();
          }, 1_200);
        });
      }

      if (replayBattleIdRef.current !== battleResponse.id) return;

      replayBattleIdRef.current = null;
      setBattle((prev) => {
        if (!prev || prev.id !== battleResponse.id) return prev;
        return {
          ...prev,
          currentRound: battleResponse.current_round,
          status: battleResponse.status,
          errorMessage: battleResponse.error_message,
        };
      });
    } catch (error) {
      console.error('Failed to load shared battle:', error);
      clearBattleFromUrl();
    }
  };

  const startBattleFromConfig = async (config: BattleConfig) => {
    stopActiveStream();
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
      activeBattleIdRef.current = response.id;

      console.log('Starting stream for battle:', response.id);
      streamCleanupRef.current = streamBattle(
        response.id,
        (message) => {
          if (activeBattleIdRef.current !== response.id) return;

          console.log('Received message:', message);
          setBattle((prev) => {
            if (!prev || prev.id !== response.id) return prev;
            return {
              ...prev,
              messages: [...prev.messages, message],
              currentRound: message.round_number,
            };
          });
        },
        () => {
          if (activeBattleIdRef.current !== response.id) return;

          streamCleanupRef.current = null;
          activeBattleIdRef.current = null;
          console.log('Battle stream completed');
          setBattle((prev) => {
            if (!prev || prev.id !== response.id) return prev;
            // Save to IndexedDB when battle completes
            saveBattleToIndexedDB(
              prev.id,
              prev.topic,
              prev.title,
              'completed'
            );
            saveOwnedBattleId(prev.id);
            return { ...prev, status: 'completed' };
          });
        },
        (error) => {
          if (activeBattleIdRef.current !== response.id) return;

          streamCleanupRef.current = null;
          activeBattleIdRef.current = null;
          console.error('Battle stream error:', error);
          setBattle((prev) => {
            if (!prev || prev.id !== response.id) return prev;
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
    stopActiveStream();
    setBattle(null);
  };

  const handleLoadBattle = async (battleId: string) => {
    stopActiveStream();
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
      
      clearBattleFromUrl();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load battle';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-['Source Sans Pro'] text-[#1b2021]">
      <header className="relative mb-0 flex items-center justify-center border-b border-[#cfe1e8] bg-[#f7fcff] px-5 py-4 text-center sm:mb-8 sm:block sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <h1 className="mb-0 text-2xl font-bold no-underline sm:mb-2 sm:text-4xl sm:underline sm:decoration-[#f6ad7b] sm:underline-offset-4">
          LLM Wars
        </h1>
        {battle && (
          <button
            className="absolute right-5 min-h-10 rounded-md bg-[#1b2021] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b2021] focus-visible:ring-offset-2 sm:hidden"
            onClick={handleReset}
            type="button"
          >
            New
          </button>
        )}
        <p className="mx-auto hidden max-w-md text-base text-[#555] sm:block sm:max-w-none sm:text-lg">
          Watch 3 AI models debate any topic with custom personas
        </p>
      </header>

      <main className="bg-[#eff8fc] sm:rounded-xl sm:bg-[#f2eee5] sm:p-8 sm:shadow-lg">
        {!battle ? (
          <div className="p-4 sm:p-0">
            <BattleSetup onStartBattle={handleStartBattle} isLoading={isLoading} />
            <div className="mt-5">
              <PastBattles onLoadBattle={handleLoadBattle} />
            </div>
          </div>
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
            animateMessages={battle.animateMessages}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
