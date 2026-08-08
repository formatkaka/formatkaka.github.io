const OWNED_BATTLE_IDS_KEY = 'llm-wars:owned-battle-ids';
const MAX_OWNED_BATTLES = 100;

function getOwnedBattleIds(): string[] {
  try {
    const storedIds = window.localStorage.getItem(OWNED_BATTLE_IDS_KEY);
    if (!storedIds) return [];

    const parsedIds: unknown = JSON.parse(storedIds);
    return Array.isArray(parsedIds)
      ? parsedIds.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveOwnedBattleId(battleId: string): void {
  try {
    const battleIds = getOwnedBattleIds().filter((id) => id !== battleId);
    battleIds.push(battleId);
    window.localStorage.setItem(
      OWNED_BATTLE_IDS_KEY,
      JSON.stringify(battleIds.slice(-MAX_OWNED_BATTLES))
    );
  } catch {
    // Local storage may be unavailable or full; replay remains the fallback.
  }
}

export function isOwnedBattleId(battleId: string): boolean {
  return getOwnedBattleIds().includes(battleId);
}
