import { LLM_COLORS, LLM_LABELS, PRESET_PERSONAS } from '../types';
import type { LLMConfig, LLMProvider } from '../types';

type VoteCardProps = {
  llm: LLMConfig;
  isSelected: boolean;
  percentage: number;
  hasVoted: boolean;
  onVote: () => void;
  disabled: boolean;
};

export function VoteCard({ llm, isSelected, percentage, hasVoted, onVote, disabled }: VoteCardProps) {
  const personaLabel = PRESET_PERSONAS.find((p) => p.description === llm.persona)?.label || 'Custom';
  const color = LLM_COLORS[llm.provider];

  return (
    <button
      onClick={onVote}
      disabled={disabled}
      className={`relative rounded-xl border-2 border-transparent bg-[#fafafa] px-4 py-5 outline-none transition ${
        isSelected ? 'border-[#f6ad7b] bg-[#fff5ef]' : ''
      } ${hasVoted && !isSelected ? 'opacity-50' : ''}`}
      type="button"
    >
      <div 
        className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {llm.provider.charAt(0).toUpperCase()}
      </div>
      <div className="text-sm font-semibold text-[#1b2021]">{LLM_LABELS[llm.provider]}</div>
      <div className="mt-1 text-xs text-[#888]">{personaLabel}</div>

      {hasVoted && (
        <div className="mt-3">
          <div className="mb-1 h-1.5 overflow-hidden rounded bg-[#e5e5e5]">
            <div 
              style={{ width: `${percentage}%`, backgroundColor: color }}
              className="h-full"
            />
          </div>
          <span className="text-xs font-semibold text-[#666]">{percentage}%</span>
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-2 -right-2 rounded-full bg-[#f6ad7b] px-2 py-1 text-[10px] font-semibold text-white">
          Your pick!
        </div>
      )}
    </button>
  );
}
