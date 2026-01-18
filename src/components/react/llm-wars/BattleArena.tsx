import { useEffect, useRef, useState } from 'react';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { LLM_COLORS, LLM_LABELS, PRESET_PERSONAS } from './types';

import type { BattleMessage, BattleStatus, LLMConfig, LLMProvider } from './types';

type BattleArenaProps = {
  topic: string;
  title: string;
  messages: BattleMessage[];
  currentRound: number;
  totalRounds: number;
  status: BattleStatus;
  errorMessage: string | null;
  llms: LLMConfig[];
  onReset: () => void;
};

export function BattleArena(props: BattleArenaProps) {
  const {
    topic,
    title,
    messages,
    currentRound,
    totalRounds,
    status,
    errorMessage,
    llms,
    onReset,
  } = props;

  const [votes, setVotes] = useState<Record<LLMProvider, number>>({
    openai: 0,
    claude: 0,
    grok: 0,
  });
  const [userVote, setUserVote] = useState<LLMProvider | null>(null);

  const handleVote = (provider: LLMProvider) => {
    if (userVote) return;
    setUserVote(provider);
    setVotes((prev) => ({ ...prev, [provider]: prev[provider] + 1 }));
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const getVotePercentage = (provider: LLMProvider) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[provider] / totalVotes) * 100);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="battle-arena">
      {/* Header */}
      <div className="arena-header">
        <div className="header-left">
          <h2 className="battle-title">{title}</h2>
          <p className="battle-topic">{topic}</p>
        </div>
        <button onClick={onReset} className="new-btn" type="button">
          New Battle
        </button>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="round-info">
          Round <span className="round-num">{currentRound}</span> of {totalRounds}
        </div>
        <div className={`status-badge ${status}`}>
          {status === 'in_progress' && '● In Progress'}
          {status === 'completed' && '✓ Completed'}
          {status === 'error' && '✕ Error'}
          {status === 'pending' && '○ Pending'}
        </div>
      </div>

      {errorMessage && (
        <div className="error-box">
          {errorMessage}
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {Object.entries(messagesByRound).map(([round, roundMessages]) => (
          <div key={round} className="round-section">
            <div className="round-header">
              <span>Round {round}</span>
            </div>
            <div className="round-messages">
              {roundMessages.map((message, idx) => (
                <MessageBubble key={`${round}-${idx}`} message={message} llms={llms} />
              ))}
            </div>
          </div>
        ))}

        {typingLLM && (
          <div className="typing-wrapper">
            <TypingIndicator
              name={typingLLM.name}
              color={LLM_COLORS[typingLLM.provider]}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Victory Section */}
      {status === 'completed' && (
        <div className="victory-section">
          <h3 className="victory-title">Who won this debate?</h3>
          
          <div className="vote-grid">
            {llms.map((llm) => {
              const personaLabel =
                PRESET_PERSONAS.find((p) => p.description === llm.persona)?.label || 'Custom';
              const isSelected = userVote === llm.provider;
              const percentage = getVotePercentage(llm.provider);

              return (
                <button
                  key={llm.provider}
                  onClick={() => handleVote(llm.provider)}
                  disabled={userVote !== null}
                  className={`vote-card ${isSelected ? 'selected' : ''} ${userVote && !isSelected ? 'faded' : ''}`}
                  type="button"
                >
                  <div 
                    className="vote-avatar"
                    style={{ backgroundColor: LLM_COLORS[llm.provider] }}
                  >
                    {llm.provider.charAt(0).toUpperCase()}
                  </div>
                  <div className="vote-name">{LLM_LABELS[llm.provider]}</div>
                  <div className="vote-persona">{personaLabel}</div>

                  {userVote && (
                    <div className="vote-result">
                      <div className="result-bar">
                        <div 
                          className="result-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: LLM_COLORS[llm.provider]
                          }}
                        />
                      </div>
                      <span className="result-percent">{percentage}%</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="winner-badge">Your pick!</div>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={onReset} className="rematch-btn" type="button">
            Start New Battle
          </button>
        </div>
      )}

      <style>{`
        .battle-arena {
          font-family: 'Source Sans Pro', sans-serif;
        }
        
        /* Header */
        .arena-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }
        
        .battle-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1b2021;
          margin: 0 0 0.25rem;
        }
        
        .battle-topic {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }
        
        .new-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.875rem;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .new-btn:hover {
          border-color: #f6ad7b;
          color: #1b2021;
        }
        
        /* Status Bar */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 8px;
        }
        
        .round-info {
          font-size: 0.875rem;
          color: #666;
        }
        
        .round-num {
          font-weight: 700;
          color: #1b2021;
        }
        
        .status-badge {
          font-size: 0.8125rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }
        
        .status-badge.in_progress {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.completed {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .status-badge.error {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-badge.pending {
          background: #f5f5f5;
          color: #666;
        }
        
        /* Error Box */
        .error-box {
          padding: 1rem;
          background: #ffebee;
          border-radius: 8px;
          color: #c62828;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        
        /* Messages */
        .messages-container {
          background: white;
          border-radius: 12px;
          min-height: 300px;
          max-height: 500px;
          overflow-y: auto;
        }
        
        .round-section {
          border-bottom: 1px solid #f0f0f0;
        }
        
        .round-section:last-child {
          border-bottom: none;
        }
        
        .round-header {
          position: sticky;
          top: 0;
          background: #fafafa;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .round-messages {
          padding: 0.5rem 0;
        }
        
        .typing-wrapper {
          padding: 0.5rem 1rem;
          border-top: 1px solid #f0f0f0;
        }
        
        /* Scrollbar */
        .messages-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }
        
        /* Victory Section */
        .victory-section {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          text-align: center;
        }
        
        .victory-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1b2021;
          margin: 0 0 1.25rem;
        }
        
        .vote-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .vote-card {
          padding: 1.25rem 1rem;
          background: #fafafa;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        
        .vote-card:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #ddd;
        }
        
        .vote-card.selected {
          background: #fff5ef;
          border-color: #f6ad7b;
        }
        
        .vote-card.faded {
          opacity: 0.5;
        }
        
        .vote-card:disabled {
          cursor: default;
        }
        
        .vote-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }
        
        .vote-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1b2021;
        }
        
        .vote-persona {
          font-size: 0.75rem;
          color: #888;
          margin-top: 0.125rem;
        }
        
        .vote-result {
          margin-top: 0.75rem;
        }
        
        .result-bar {
          height: 6px;
          background: #e5e5e5;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }
        
        .result-fill {
          height: 100%;
          transition: width 0.5s ease-out;
        }
        
        .result-percent {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
        }
        
        .winner-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f6ad7b;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
        }
        
        .rematch-btn {
          padding: 0.75rem 2rem;
          background: #1b2021;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .rematch-btn:hover {
          background: #333;
        }
        
        @media (max-width: 640px) {
          .arena-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .vote-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
