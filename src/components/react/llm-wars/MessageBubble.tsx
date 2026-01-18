import { LLM_COLORS, PRESET_PERSONAS } from './types';

import type { BattleMessage, LLMConfig } from './types';

type MessageBubbleProps = {
  message: BattleMessage;
  llms: LLMConfig[];
};

export function MessageBubble(props: MessageBubbleProps) {
  const { message, llms } = props;

  const color = LLM_COLORS[message.provider];
  const llmConfig = llms.find((llm) => llm.provider === message.provider);

  const personaLabel = PRESET_PERSONAS.find(
    (p) => p.description === llmConfig?.persona
  )?.label || 'Custom';

  return (
    <div className="message-bubble">
      <div 
        className="avatar"
        style={{ backgroundColor: color }}
      >
        {message.name.charAt(0).toUpperCase()}
      </div>
      <div className="content">
        <div className="header">
          <span className="name" style={{ color }}>{message.name}</span>
          <span className="persona">{personaLabel}</span>
        </div>
        <p className="text">{message.content}</p>
      </div>

      <style>{`
        .message-bubble {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
        }
        
        .message-bubble:hover {
          background: #fafafa;
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        
        .content {
          flex: 1;
          min-width: 0;
        }
        
        .header {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .name {
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .persona {
          font-size: 0.75rem;
          color: #999;
        }
        
        .text {
          font-size: 0.9375rem;
          color: #333;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

type TypingIndicatorProps = {
  name: string;
  color: string;
};

export function TypingIndicator(props: TypingIndicatorProps) {
  const { name, color } = props;

  return (
    <div className="typing-indicator">
      <div 
        className="avatar"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="content">
        <span className="name" style={{ color }}>{name}</span>
        <div className="dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>

      <style>{`
        .typing-indicator {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        
        .content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .name {
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .dots {
          display: flex;
          gap: 4px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          background: #ccc;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.16s; }
        .dot:nth-child(3) { animation-delay: 0.32s; }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
