import { useEffect, useState } from 'react';
import { LLM_COLORS } from './types';
import { getPersonaDisplay } from './utils';

import type { BattleMessage, LLMConfig } from './types';

type MessageBubbleProps = {
  message: BattleMessage;
  llms: LLMConfig[];
};

export function MessageBubble(props: MessageBubbleProps) {
  const { message, llms } = props;

  const color = LLM_COLORS[message.provider];
  const llmConfig = llms.find((llm) => llm.provider === message.provider);
  const personaDisplay = getPersonaDisplay(llmConfig);

  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const content = message.content || '';
    if (!content) {
      setDisplayText('');
      setIsAnimating(false);
      return;
    }

    const useWords = content.includes(' ');
    const tokens = useWords ? content.split(' ') : content.split('');
    let index = 0;

    setDisplayText('');
    setIsAnimating(true);

    const interval = setInterval(() => {
      const nextIndex = index + 1;
      if (nextIndex >= tokens.length) {
        setDisplayText(content);
        setIsAnimating(false);
        clearInterval(interval);
        return;
      }

      const nextText = tokens.slice(0, nextIndex).join(useWords ? ' ' : '');
      setDisplayText(nextText);
      index = nextIndex;
    }, useWords ? 90 : 40);

    return () => clearInterval(interval);
  }, [message.content]);

  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-[#fafafa]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {message.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1">
          <span className="text-sm font-semibold" style={{ color }}>
            {message.name}
          </span>
          <span className="text-sm text-[#999]"> - {personaDisplay}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-[#333] whitespace-pre-wrap break-words">
          {displayText}
          {isAnimating && (
            <span className="ml-1 inline-block text-[#999] animate-pulse">▍</span>
          )}
        </p>
      </div>
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
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color }}>
          {name}
        </span>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ccc] animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ccc] animate-bounce" style={{ animationDelay: '0.16s' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ccc] animate-bounce" style={{ animationDelay: '0.32s' }} />
        </div>
      </div>
    </div>
  );
}
