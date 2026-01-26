import type { BattleResponse, BattleConfig, LLMConfig, BattleMode, Language, BattleMessage, LLMProvider } from './types';

const API_BASE = import.meta.env.PUBLIC_LLM_WARS_API || 'http://localhost:5123';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export async function createBattle(
  topic: string,
  mode: BattleMode,
  language: Language,
  rounds: number,
  llms: LLMConfig[]
): Promise<BattleResponse> {
  return apiRequest<BattleResponse>('/api/battle/', {
    method: 'POST',
    body: JSON.stringify({ topic, mode, language, rounds, llms }),
  });
}

export async function getBattle(battleId: string): Promise<BattleResponse> {
  return apiRequest<BattleResponse>(`/api/battle/${battleId}`);
}

export async function getBattleConfig(battleId: string): Promise<BattleConfig> {
  return apiRequest<BattleConfig>(`/api/battle/${battleId}/config`);
}

export async function runBattleSync(battleId: string): Promise<BattleResponse> {
  return apiRequest<BattleResponse>(`/api/battle/${battleId}/run`, {
    method: 'POST',
  });
}

export function streamBattle(
  battleId: string,
  onMessage: (message: BattleMessage) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  const url = `${API_BASE}/api/battle/${battleId}/stream`;
  console.log('🔌 Connecting to stream:', url);
  
  const eventSource = new EventSource(url);

  eventSource.onopen = () => {
    console.log('✅ EventSource connected');
  };

  eventSource.onmessage = (event) => {
    try {
      console.log('📨 Received message:', event.data);
      const data = JSON.parse(event.data);

      if (data.type === 'complete') {
        console.log('✅ Battle complete');
        onComplete();
        eventSource.close();
      } else if (data.type === 'error') {
        console.error('❌ Battle error:', data.message);
        onError(data.message);
        eventSource.close();
      } else {
        console.log('💬 Battle message:', data);
        onMessage(data as BattleMessage);
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error, event.data);
      onError('Failed to parse message');
    }
  };

  eventSource.onerror = (error) => {
    console.error('❌ EventSource error:', error);
    // EventSource will automatically retry, so only close on persistent errors
    if (eventSource.readyState === EventSource.CLOSED) {
      onError('Connection lost');
      eventSource.close();
    }
  };

  return () => {
    console.log('🔌 Closing EventSource');
    eventSource.close();
  };
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
  return apiRequest<SurpriseConfig>('/api/battle/surprise');
}

export async function voteForBattle(battleId: string, provider: LLMProvider): Promise<void> {
  await apiRequest(`/api/battle/${battleId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ provider }),
  });
}

export async function getBattleVotes(battleId: string): Promise<Record<LLMProvider, number>> {
  return apiRequest<Record<LLMProvider, number>>(`/api/battle/${battleId}/votes`);
}
