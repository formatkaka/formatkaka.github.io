import { useEffect, useRef, useState } from 'react';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { LLM_COLORS } from './types';
import { voteForBattle, getBattleVotes, submitBattleFeedback } from './api';
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
  const [feedbackChoice, setFeedbackChoice] = useState<boolean | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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

  const submitFeedback = async (liked: boolean) => {
    if (feedbackState === 'saving') return;

    setFeedbackChoice(liked);
    setFeedbackState('saving');
    try {
      await submitBattleFeedback(battleId, liked);
      setFeedbackState('saved');
    } catch (error) {
      console.error('Failed to save feedback:', error);
      setFeedbackState('error');
    }
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
          <h2 className="mb-1 text-xl font-bold text-[#1b2021] text-pretty dark:text-[#f1f3f7]">{title}</h2>
          <p className="text-sm text-[#666] break-words dark:text-[#a0a8b6]">{topic}</p>
        </div>
        <button
          onClick={onReset}
          className="min-h-11 rounded-md border-0 bg-white px-4 py-2 text-sm font-semibold text-[#555] transition hover:bg-[#fff8f4] hover:text-[#1b2021] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b] dark:bg-[#1b212d] dark:text-[#c8ced8] dark:hover:bg-[#252c39] dark:hover:text-white sm:mr-28"
          type="button"
        >
          New Battle
        </button>
      </div>

      {/* Status Bar */}
      <div className="mb-0 flex min-h-12 items-center justify-between gap-3 border-y border-[#cfe1e8] bg-[#e6f4fb] px-4 py-2 dark:border-[#2a3341] dark:bg-[#171e29] sm:mb-4 sm:min-h-0 sm:rounded-lg sm:border-0 sm:bg-white sm:px-4 sm:py-3 sm:dark:bg-[#191f2b]">
        <p className="min-w-0 truncate text-base font-semibold text-[#1b2021] dark:text-[#eef0f6] sm:hidden">{topic}</p>
        <div className="hidden text-sm text-[#666] dark:text-[#a0a8b6] sm:block">
          Round <span className="font-bold text-[#1b2021] dark:text-[#eef0f6]">{currentRound}</span> of {totalRounds}
        </div>
        <div className="shrink-0 rounded-sm bg-[#d3eaf5] px-2 py-1 text-sm font-semibold text-[#164484] dark:bg-[#263852] dark:text-[#8eb8f4] sm:bg-transparent sm:px-0 sm:py-0 sm:text-inherit sm:dark:bg-transparent">
          <span className="sm:hidden">Round {currentRound}/{totalRounds}</span>
          <div className="hidden sm:block"><StatusBadge status={status} /></div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-[#ffebee] px-4 py-3 text-sm text-[#c62828] dark:bg-[#3a1d22] dark:text-[#ff9da8]">
          {errorMessage}
        </div>
      )}

      {/* Messages */}
      <div
        className="relative min-h-0 max-h-none overflow-visible bg-transparent pb-0 sm:min-h-[300px] sm:max-h-[500px] sm:overflow-y-auto sm:rounded-xl sm:bg-white sm:pb-10 sm:dark:bg-[#151a24]"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {Object.entries(messagesByRound).map(([round, roundMessages]) => (
          <div key={round} className="border-b border-[#d9e5e8] dark:border-[#2a3341] sm:border-[#f0f0f0] sm:dark:border-[#282f3c]">
            <div className="bg-[#edf7fb] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#66747a] dark:bg-[#151c27] dark:text-[#929baa] sm:sticky sm:top-0 sm:border-b sm:border-[#f0f0f0] sm:bg-[#fafafa] sm:text-[#888] sm:dark:border-[#282f3c] sm:dark:bg-[#1a202b] sm:dark:text-[#929baa]">
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
          <div className="border-t border-[#d9e5e8] bg-white px-4 py-3 dark:border-[#2a3341] dark:bg-[#191f2b] sm:border-[#f0f0f0] sm:py-2 sm:dark:border-[#282f3c] sm:dark:bg-[#151a24]">
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
            className="pointer-events-auto inline-flex min-h-10 items-center gap-1 rounded-full border border-[#f6ad7b] bg-[#fff8f4] px-3 py-1.5 text-xs font-semibold text-[#1b2021] shadow-md transition hover:border-[#e8946a] hover:bg-[#ffe9dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6ad7b] dark:border-[#915937] dark:bg-[#2c211b] dark:text-[#f3d7c7] dark:hover:bg-[#3a291f]"
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
                : 'bg-[#fff8f4] hover:bg-[#ffe9dd] hover:border-[#e8946a] dark:bg-[#2c211b] dark:text-[#f3d7c7] dark:hover:bg-[#3a291f]'
            }`}
            type="button"
          >
            {shareCopied ? '✓ Copied!' : '🔗 Share Battle'}
          </button>
        </div>
      )}

      {/* Victory Section */}
      {status === 'completed' && (
        <div className="mt-0 border-t border-[#d9e5e8] bg-white p-4 text-center dark:border-[#2a3341] dark:bg-[#151a24] sm:mt-6 sm:rounded-xl sm:border-0 sm:p-6">
          <h3 className="mb-5 text-lg font-semibold text-[#1b2021] dark:text-[#eef0f6]">Who won this debate?</h3>
          
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
            className="min-h-12 w-full rounded-lg border-0 bg-[#1b2021] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b2021] focus-visible:ring-offset-2 dark:bg-[#f0f2f7] dark:text-[#151821] dark:hover:bg-white sm:w-auto"
            type="button"
          >
            Start New Battle
          </button>

          <div className="mx-auto mt-8 max-w-xl border-t border-[#e5e9f0] pt-6 text-left dark:border-[#2a3341]">
            {feedbackState === 'saved' ? (
              <p className="text-center text-sm font-semibold text-[#2e7d32] dark:text-[#7bd69d]">Thanks — your feedback was saved.</p>
            ) : (
              <>
                <p className="text-center text-sm font-semibold text-[#1b2021] dark:text-[#eef0f6]">Was this battle worth watching?</p>
                <div className="mt-3 flex justify-center gap-3">
                  <button
                    aria-pressed={feedbackChoice === true}
                    className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0] ${feedbackChoice === true ? 'bg-[#dff3e6] text-[#246238] dark:bg-[#1f4830] dark:text-[#9ce2b3]' : 'bg-[#f1f4f8] text-[#4f5a69] hover:bg-[#e4ebf4] dark:bg-[#222a37] dark:text-[#c6ceda] dark:hover:bg-[#2d3747]'}`}
                    disabled={feedbackState === 'saving'}
                    onClick={() => submitFeedback(true)}
                    type="button"
                  >
                    👍 Yes
                  </button>
                  <button
                    aria-pressed={feedbackChoice === false}
                    className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0] ${feedbackChoice === false ? 'bg-[#fde7e5] text-[#a33d35] dark:bg-[#4a2729] dark:text-[#ffaaa4]' : 'bg-[#f1f4f8] text-[#4f5a69] hover:bg-[#e4ebf4] dark:bg-[#222a37] dark:text-[#c6ceda] dark:hover:bg-[#2d3747]'}`}
                    disabled={feedbackState === 'saving'}
                    onClick={() => submitFeedback(false)}
                    type="button"
                  >
                    👎 No
                  </button>
                </div>
                {feedbackState === 'saving' && <p className="mt-3 text-center text-sm text-[#4f5a69] dark:text-[#c6ceda]">Saving…</p>}
                {feedbackState === 'error' && <p className="mt-3 text-center text-sm text-[#c62828] dark:text-[#ff9da8]">Couldn’t save feedback. Please try again.</p>}
              </>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
}
