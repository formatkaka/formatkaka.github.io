import { useEffect, useState } from 'react';
import { getBattlesFromIndexedDB } from './indexedDB';
import { getBattle } from './api';
import { formatRelativeTime } from './utils';

type PastBattlesProps = {
  onLoadBattle: (battleId: string) => void;
};

type BattleRecord = {
  id: string;
  topic: string;
  title: string;
  createdAt: number;
  status: string;
};

export function PastBattles(props: PastBattlesProps) {
  const { onLoadBattle } = props;
  const [battles, setBattles] = useState<BattleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [copiedBattleId, setCopiedBattleId] = useState<string | null>(null);

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      const savedBattles = await getBattlesFromIndexedDB();
      setBattles(savedBattles);
    } catch (error) {
      console.error('Failed to load battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBattle = async (battleId: string) => {
    try {
      // Fetch battle from API to get full data
      await getBattle(battleId);
      onLoadBattle(battleId);
    } catch (error) {
      console.error('Failed to load battle:', error);
      alert('Battle not found. It may have been deleted from the server.');
    }
  };

  const handleCopyLink = async (battleId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?battle=${battleId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedBattleId(battleId);
      window.setTimeout(() => setCopiedBattleId(null), 2_000);
    } catch (error) {
      console.error('Failed to copy battle link:', error);
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1b2021]">
            Recent Battles
          </h3>
        </div>
        <p className="text-sm text-[#666]">Loading...</p>
      </div>
    );
  }

  if (battles.length === 0) {
    return null;
  }

  const visibleBattles = showAll ? battles : battles.slice(0, 3);

  return (
    <div className="mt-10 border-t-0 pt-0 sm:mt-8 sm:border-t sm:border-[#e6e2da] sm:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1b2021]">
          Recent Battles
        </h3>
        {battles.length > 3 && (
          <button
            className="text-sm font-semibold text-[#c95012] transition hover:text-[#a63e0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e77943] sm:text-[#f6ad7b] sm:hover:text-[#e8946a]"
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Show less' : 'See all'}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {visibleBattles.map((battle) => (
          <div
            key={battle.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-[#c7e3f1] bg-white px-4 py-3 text-left transition hover:border-[#8dc7e5] sm:border-[#e6e2da] sm:hover:border-[#f6ad7b] sm:hover:bg-[#fff8f4] sm:hover:shadow-sm"
          >
            <button
              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5]"
              onClick={() => handleLoadBattle(battle.id)}
              type="button"
            >
              <div className="truncate text-sm font-semibold text-[#1b2021]">
                {battle.title}
              </div>
              <div className="truncate text-xs text-[#777]">{battle.topic}</div>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[11px] text-[#999]">{formatRelativeTime(battle.createdAt)}</span>
              <button
                className="text-xs font-semibold text-[#c95012] transition hover:text-[#a63e0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e77943] sm:text-[#f6ad7b] sm:hover:text-[#e8946a]"
                onClick={() => handleCopyLink(battle.id)}
                type="button"
              >
                {copiedBattleId === battle.id ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
