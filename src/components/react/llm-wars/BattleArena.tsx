import { useEffect, useRef, useState } from 'react';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { LLM_COLORS } from './types';
import { voteForBattle, getBattleVotes } from './api';
import { StatusBadge } from './components/StatusBadge';
import { VoteCard } from './components/VoteCard';

import type { BattleMessage, BattleStatus, LLMConfig, LLMProvider } from './types';

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
  animateMessages: boolean;
  onReset: () => void;
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
    animateMessages,
    onReset,
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
      {/* Header */}
      <div className="hidden mb-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="mb-1 text-xl font-bold text-[#1b2021] text-pretty">{title}</h2>
          <p className="text-sm text-[#666] break-words">{topic}</p>
        </div>
        <button
          onClick={onReset}
          className="min-h-11 rounded-md border-0 bg-white px-4 py-2 text-sm font-semibold text-[#555] transition hover:bg-[#fff8f4] hover:text-[#1b2021] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b]"
          type="button"
        >
          New Battle
        </button>
      </div>

      {/* Status Bar */}
      <div className="mb-0 flex min-h-12 items-center justify-between gap-3 border-y border-[#cfe1e8] bg-[#e6f4fb] px-4 py-2 sm:mb-4 sm:min-h-0 sm:rounded-lg sm:border-0 sm:bg-white sm:px-4 sm:py-3">
        <p className="min-w-0 truncate text-base font-semibold text-[#1b2021] sm:hidden">{topic}</p>
        <div className="hidden text-sm text-[#666] sm:block">
          Round <span className="font-bold text-[#1b2021]">{currentRound}</span> of {totalRounds}
        </div>
        <div className="shrink-0 rounded-sm bg-[#d3eaf5] px-2 py-1 text-sm font-semibold text-[#164484] sm:bg-transparent sm:px-0 sm:py-0 sm:text-inherit">
          <span className="sm:hidden">Round {currentRound}/{totalRounds}</span>
          <div className="hidden sm:block"><StatusBadge status={status} /></div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-[#ffebee] px-4 py-3 text-sm text-[#c62828]">
          {errorMessage}
        </div>
      )}

      {/* Messages */}
      <div
        className="relative min-h-0 max-h-none overflow-visible bg-transparent pb-0 sm:min-h-[300px] sm:max-h-[500px] sm:overflow-y-auto sm:rounded-xl sm:bg-white sm:pb-10"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {Object.entries(messagesByRound).map(([round, roundMessages]) => (
          <div key={round} className="border-b border-[#d9e5e8] sm:border-[#f0f0f0]">
            <div className="bg-[#edf7fb] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#66747a] sm:sticky sm:top-0 sm:border-b sm:border-[#f0f0f0] sm:bg-[#fafafa] sm:text-[#888]">
              Round {round}
            </div>
            <div className="px-4 py-3 sm:px-0 sm:py-2">
              {roundMessages.map((message, idx) => (
                <MessageBubble
                  key={`${round}-${idx}`}
                  message={message}
                  llms={llms}
                  animate={animateMessages}
                />
              ))}
            </div>
          </div>
        ))}

        {typingLLM && (
          <div className="border-t border-[#d9e5e8] bg-white px-4 py-3 sm:border-[#f0f0f0] sm:py-2">
            <TypingIndicator
              name={typingLLM.name}
              color={LLM_COLORS[typingLLM.provider]}
            />
          </div>
        )}

        <div ref={messagesEndRef} />

        <div
          className={`pointer-events-none sticky bottom-4 hidden justify-end px-4 pb-4 transition-all duration-200 sm:flex ${
            showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          <button
            className="pointer-events-auto inline-flex min-h-10 items-center gap-1 rounded-full border border-[#f6ad7b] bg-[#fff8f4] px-3 py-1.5 text-xs font-semibold text-[#1b2021] shadow-md transition hover:border-[#e8946a] hover:bg-[#ffe9dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b]"
            type="button"
            onClick={scrollToBottom}
          >
            ↓ Scroll to latest
          </button>
        </div>
      </div>

      {/* Share Button - Always visible, enabled when completed */}
      {status === 'completed' && (
        <div className="my-4 flex justify-center px-4 sm:px-0">
          <button
            onClick={handleShare}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#f6ad7b] px-4 py-2 text-sm font-semibold text-[#1b2021] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b] sm:w-auto ${
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
        <div className="mt-0 border-t border-[#d9e5e8] bg-white p-4 text-center sm:mt-6 sm:rounded-xl sm:border-0 sm:p-6">
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
            className="min-h-12 w-full rounded-lg border-0 bg-[#1b2021] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b2021] focus-visible:ring-offset-2 sm:w-auto"
            type="button"
          >
            Start New Battle
          </button>
        </div>
      )}

      
    </div>
  );
}
