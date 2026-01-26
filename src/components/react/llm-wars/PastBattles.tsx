import { useEffect, useState } from 'react';
import { getBattlesFromIndexedDB } from './indexedDB';
import { getBattle } from './api';
import { formatRelativeTime, getStatusBadgeConfig } from './utils';
import { StatusBadge } from './components/StatusBadge';

import type { BattleResponse } from './types';

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
    <div className="mt-8 border-t border-[#e6e2da] pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1b2021]">
          Recent Battles
        </h3>
        {battles.length > 3 && (
          <button
            className="text-sm font-semibold text-[#f6ad7b] outline-none transition hover:text-[#e8946a]"
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Show less' : 'See all'}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {visibleBattles.map((battle) => (
          <button
            key={battle.id}
            onClick={() => handleLoadBattle(battle.id)}
            className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e2da] bg-white px-4 py-3 text-left outline-none transition-all hover:border-[#f6ad7b] hover:bg-[#fff8f4] hover:shadow-sm"
            type="button"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#1b2021]">
                {battle.title}
              </div>
              <div className="truncate text-xs text-[#777]">{battle.topic}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[11px] text-[#999]">{formatRelativeTime(battle.createdAt)}</span>
              <StatusBadge status={battle.status} size="small" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
