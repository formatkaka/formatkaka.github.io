import type { BattleResponse, LLMConfig, BattleMode, Language, BattleMessage } from './types';

const API_BASE = import.meta.env.PUBLIC_LLM_WARS_API || 'http://localhost:5123';

export async function createBattle(
  topic: string,
  mode: BattleMode,
  language: Language,
  rounds: number,
  llms: LLMConfig[]
): Promise<BattleResponse> {
  const response = await fetch(`${API_BASE}/api/battle/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, mode, language, rounds, llms }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create battle');
  }

  return response.json();
}

export async function getBattle(battleId: string): Promise<BattleResponse> {
  const response = await fetch(`${API_BASE}/api/battle/${battleId}`);

  if (!response.ok) {
    throw new Error('Failed to get battle');
  }

  return response.json();
}

export async function runBattleSync(battleId: string): Promise<BattleResponse> {
  const response = await fetch(`${API_BASE}/api/battle/${battleId}/run`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to run battle');
  }

  return response.json();
}

export function streamBattle(
  battleId: string,
  onMessage: (message: BattleMessage) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/battle/${battleId}/stream`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'complete') {
      onComplete();
      eventSource.close();
    } else if (data.type === 'error') {
      onError(data.message);
      eventSource.close();
    } else {
      onMessage(data as BattleMessage);
    }
  };

  eventSource.onerror = () => {
    onError('Connection lost');
    eventSource.close();
  };

  return () => eventSource.close();
}

export type SurpriseConfig = {
  topic: string;
  personas: Array<{
    provider: string;
    persona: string;
    name: string;
  }>;
};

export async function getSurpriseConfig(): Promise<SurpriseConfig> {
  const response = await fetch(`${API_BASE}/api/battle/surprise`);

  if (!response.ok) {
    throw new Error('Failed to get surprise configuration');
  }

  return response.json();
}
