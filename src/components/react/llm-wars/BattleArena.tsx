import { useEffect, useRef, useState } from 'react';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { LLM_COLORS } from './types';
import { voteForBattle, getBattleVotes } from './api';
import { StatusBadge } from './components/StatusBadge';
import { VoteCard } from './components/VoteCard';
import { SharedBattleOverlay } from './components/SharedBattleOverlay';

import type { BattleMessage, BattleStatus, LLMConfig, LLMProvider } from './types';
import type { BattleConfig } from './types';

type BattleArenaProps = {
  battleId: string;
  topic: string;
  title: string;
  messages: BattleMessage[];
  currentRound: number;
  totalRounds: number;
  status: BattleStatus;
  errorMessage: string | null;
  llms: LLMConfig[];
  onReset: () => void;
  showSharedOverlay?: boolean;
  sharedBattleConfig?: BattleConfig | null;
  onViewSharedBattle?: () => void;
  loadingShared?: boolean;
};

export function BattleArena(props: BattleArenaProps) {
  const {
    battleId,
    topic,
    title,
    messages,
    currentRound,
    totalRounds,
    status,
    errorMessage,
    llms,
    onReset,
    showSharedOverlay = false,
    sharedBattleConfig,
    onViewSharedBattle,
    loadingShared = false,
  } = props;

  const [shareCopied, setShareCopied] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?battle=${battleId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const [votes, setVotes] = useState<Record<LLMProvider, number>>({
    openai: 0,
    claude: 0,
    grok: 0,
  });
  const [userVote, setUserVote] = useState<LLMProvider | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Load existing votes when battle is completed
  useEffect(() => {
    if (status === 'completed' && battleId) {
      getBattleVotes(battleId)
        .then((voteCounts) => {
          setVotes(voteCounts);
        })
        .catch((error) => {
          console.error('Failed to load votes:', error);
        });
    }
  }, [status, battleId]);

  const handleVote = async (provider: LLMProvider) => {
    if (userVote || isVoting) return;
    
    setIsVoting(true);
    try {
      await voteForBattle(battleId, provider);
      setUserVote(provider);
      setVotes((prev) => ({ ...prev, [provider]: prev[provider] + 1 }));
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Optionally show error to user
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const getVotePercentage = (provider: LLMProvider) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[provider] / totalVotes) * 100);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollIndicator = () => {
    const container = messagesContainerRef.current;
    if (!container) {
      setShowScrollIndicator(false);
      return;
    }

    const threshold = 24; // px from bottom
    const isOverflowing = container.scrollHeight > container.clientHeight + 8;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollIndicator(isOverflowing && distanceFromBottom > threshold);
  };

  useEffect(() => {
    updateScrollIndicator();
  }, [messages]);

  const handleScroll = () => {
    updateScrollIndicator();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const messagesByRound = messages.reduce<Record<number, BattleMessage[]>>((acc, msg) => {
    if (!acc[msg.round_number]) {
      acc[msg.round_number] = [];
    }
    acc[msg.round_number].push(msg);
    return acc;
  }, {});

  const getCurrentTypingLLM = () => {
    if (status !== 'in_progress') return null;

    const currentRoundMessages = messagesByRound[currentRound] || [];
    const respondedProviders = new Set(currentRoundMessages.map((m) => m.provider));

    const nextLLM = llms.find((llm) => !respondedProviders.has(llm.provider));
    return nextLLM;
  };

  const typingLLM = getCurrentTypingLLM();

  return (
    <div className="relative font-sans">
      {showSharedOverlay && sharedBattleConfig && (
        <SharedBattleOverlay
          config={sharedBattleConfig}
          loading={loadingShared}
          onViewBattle={onViewSharedBattle || (() => {})}
        />
      )}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1b2021] mb-1">{title}</h2>
          <p className="text-sm text-[#666]">{topic}</p>
        </div>
        <button
          onClick={onReset}
          className="whitespace-nowrap rounded-md border-0 bg-white px-4 py-2 text-sm font-semibold text-[#555] outline-none transition hover:bg-[#fff8f4] hover:text-[#1b2021]"
          type="button"
        >
          New Battle
        </button>
      </div>

      {/* Status Bar */}
      <div className="mb-4 flex items-center gap-4 rounded-lg bg-white px-4 py-3">
        <div className="text-sm text-[#666]">
          Round <span className="font-bold text-[#1b2021]">{currentRound}</span> of {totalRounds}
        </div>
        <StatusBadge status={status} />
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-[#ffebee] px-4 py-3 text-sm text-[#c62828]">
          {errorMessage}
        </div>
      )}

      {/* Messages */}
      <div
        className="relative max-h-[500px] min-h-[300px] overflow-y-auto rounded-xl bg-white pb-10"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {Object.entries(messagesByRound).map(([round, roundMessages]) => (
          <div key={round} className="border-b border-[#f0f0f0]">
            <div className="sticky top-0 border-b border-[#f0f0f0] bg-[#fafafa] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#888]">
              Round {round}
            </div>
            <div className="py-2">
              {roundMessages.map((message, idx) => (
                <MessageBubble key={`${round}-${idx}`} message={message} llms={llms} />
              ))}
            </div>
          </div>
        ))}

        {typingLLM && (
          <div className="border-t border-[#f0f0f0] px-4 py-2">
            <TypingIndicator
              name={typingLLM.name}
              color={LLM_COLORS[typingLLM.provider]}
            />
          </div>
        )}

        <div ref={messagesEndRef} />

        <div
          className={`pointer-events-none sticky bottom-4 flex justify-end px-4 pb-4 transition-all duration-200 ${
            showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          <button
            className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-[#f6ad7b] bg-[#fff8f4] px-3 py-1.5 text-xs font-semibold text-[#1b2021] outline-none shadow-md transition hover:bg-[#ffe9dd] hover:border-[#e8946a]"
            type="button"
            onClick={scrollToBottom}
          >
            ↓ Scroll to latest
          </button>
        </div>
      </div>

      {/* Share Button - Always visible, enabled when completed */}
      {status === 'completed' && (
        <div className="my-4 flex justify-center">
          <button
            onClick={handleShare}
            className={`inline-flex items-center gap-2 rounded-full border border-[#f6ad7b] px-4 py-2 text-sm font-semibold text-[#1b2021] outline-none transition ${
              shareCopied
                ? 'bg-[#e8f5e9] border-[#4caf50] text-[#2e7d32]'
                : 'bg-[#fff8f4] hover:bg-[#ffe9dd] hover:border-[#e8946a]'
            }`}
            type="button"
          >
            {shareCopied ? '✓ Copied!' : '🔗 Share Battle'}
          </button>
        </div>
      )}

      {/* Victory Section */}
      {status === 'completed' && (
        <div className="mt-6 rounded-xl bg-white p-6 text-center">
          <h3 className="mb-5 text-lg font-semibold text-[#1b2021]">Who won this debate?</h3>
          
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {llms.map((llm) => (
              <VoteCard
                key={llm.provider}
                llm={llm}
                isSelected={userVote === llm.provider}
                percentage={getVotePercentage(llm.provider)}
                hasVoted={userVote !== null}
                onVote={() => handleVote(llm.provider)}
                disabled={userVote !== null}
              />
            ))}
          </div>

          <button
            onClick={onReset}
            className="rounded-lg border-0 bg-[#1b2021] px-8 py-3 text-base font-semibold text-white outline-none transition hover:bg-[#333]"
            type="button"
          >
            Start New Battle
          </button>
        </div>
      )}

      
    </div>
  );
}
