import type { BattleConfig } from '../types';

type SharedBattleOverlayProps = {
  config: BattleConfig;
  loading: boolean;
  onViewBattle: () => void;
};

export function SharedBattleOverlay({ config, loading, onViewBattle }: SharedBattleOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/70">
      <div className="w-[90%] max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-[#1b2021]">Shared Battle</h3>
        <p className="mb-6 text-sm text-[#666]">{config.topic}</p>
        <div className="mb-6 flex flex-col gap-2 text-sm text-[#888]">
          <span>Mode: {config.mode}</span>
          <span>Language: {config.language === 'en' ? 'English' : 'हिंदी'}</span>
          <span>Rounds: {config.rounds}</span>
        </div>
        <button
          onClick={onViewBattle}
          disabled={loading}
          className="w-full rounded-lg border-0 bg-[#1b2021] px-6 py-3 text-base font-semibold text-white outline-none transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ccc]"
          type="button"
        >
          {loading ? 'Loading...' : 'View Battle'}
        </button>
      </div>
    </div>
  );
}
