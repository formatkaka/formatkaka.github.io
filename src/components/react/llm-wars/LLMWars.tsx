import { useCallback, useEffect, useRef, useState } from 'react';
import { BattleSetup } from './BattleSetup';
import { BattleArena } from './BattleArena';
import { PastBattles } from './PastBattles';
import { createBattle, streamBattle, getBattle, getBattleConfig } from './api';
import { generateBattleTitle } from './types';
import { saveBattleToIndexedDB } from './indexedDB';
import { isOwnedBattleId, saveOwnedBattleId } from './battleOwnership';
import { ThemeSelector } from './components/ThemeSelector';

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
    mode: config.mode,
    animateMessages,
  };
}

function clearBattleFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('battle');
  window.history.replaceState({}, '', url);
}

function pushBattleToUrl(battleId: string) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('battle') === battleId) return;

  url.searchParams.set('battle', battleId);
  window.history.pushState({ battleId }, '', url);
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
  mode: BattleMode;
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

  useEffect(() => {
    const handlePopState = () => {
      const battleId = new URLSearchParams(window.location.search).get('battle');
      if (!battleId) {
        stopActiveStream();
        setBattle(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stopActiveStream]);

  // Check for shared battle in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const battleId = params.get('battle');
    
    if (battleId && !battle) {
      if (window.history.state?.battleId !== battleId) {
        const battleUrl = new URL(window.location.href);
        const homeUrl = new URL(window.location.href);
        homeUrl.searchParams.delete('battle');
        window.history.replaceState({ llmWarsHome: true }, '', homeUrl);
        window.history.pushState({ battleId }, '', battleUrl);
      }
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
      pushBattleToUrl(response.id);
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
      pushBattleToUrl(battleResponse.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load battle';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-yel-lms-root className="relative font-['Source Sans Pro'] text-[#1b2021] dark:text-[#eef0f6]">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeSelector />
      </div>

      <header className={`relative mb-0 flex items-center justify-center border-b border-[#cfe1e8] bg-[#f7fcff] px-5 py-4 text-center dark:border-[#2a3341] dark:bg-[#111620] sm:hidden ${battle ? '' : 'hidden'}`}>
        <h1 className="mb-0 text-2xl font-bold text-[#1b2021] no-underline dark:text-[#f4f5f8]">
          Yel-lms
        </h1>
        {battle && (
          <button
            className="absolute right-16 min-h-10 rounded-md bg-[#1b2021] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b2021] focus-visible:ring-offset-2 dark:bg-[#f0f2f7] dark:text-[#151821] dark:hover:bg-white sm:hidden"
            onClick={handleReset}
            type="button"
          >
            New
          </button>
        )}
      </header>

      <main className="min-h-screen bg-[#eff8fc] transition-colors dark:bg-[#0f131c] sm:bg-[#f7f8ff] sm:p-12">
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
            mode={battle.mode}
            animateMessages={battle.animateMessages}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
