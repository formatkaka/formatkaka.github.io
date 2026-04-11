// Import personas and topics from shared JSON (single source of truth for frontend + backend)
import sharedPersonas from '../../../tech/llm-projects/1-llm-wars/shared/personas.json';
import sharedTopics from '../../../tech/llm-projects/1-llm-wars/shared/topics.json';

export const LLM_PROVIDERS = ['openai', 'claude', 'grok'] as const;
export const BATTLE_MODES = ['text', 'emoji'] as const;
export const LANGUAGES = ['en', 'hi'] as const;
export const BATTLE_STATUSES = ['pending', 'in_progress', 'completed', 'error'] as const;

export const CURATED_TOPICS = sharedTopics as readonly CuratedTopic[];

export const BATTLE_TITLE_TEMPLATES = [
  'The Great {topic} War',
  'The {topic} Showdown',
  '{topic}: A Philosophical Journey',
  'The {topic} Incident of 2026',
  'Battle Royale: {topic}',
  'When AIs Debated {topic}',
  'The Ultimate {topic} Debate',
  '{topic}: The Reckoning',
  'Three AIs, One Question: {topic}',
  'The {topic} Chronicles',
] as const;

export const LLM_COLORS: Record<LLMProvider, string> = {
  openai: '#5ba37f', // Soft green
  claude: '#d4896a', // Soft coral (matches blog accent)
  grok: '#7b9fc4', // Soft blue
};

export const LLM_LABELS: Record<LLMProvider, string> = {
  openai: 'OpenAI (GPT-4o)',
  claude: 'Claude (Sonnet)',
  grok: 'Grok (xAI)',
};

// Personas loaded from shared JSON - single source of truth for frontend + backend
export const PRESET_PERSONAS = sharedPersonas as readonly {
  id: string;
  label: string;
  description: string;
  world: string;
}[];

export const CUSTOM_PERSONA_ID = 'custom';

export type CuratedTopic = {
  id: string;
  topic: string;
  characters: [string, string, string];
};

export type LLMProvider = (typeof LLM_PROVIDERS)[number];
export type BattleMode = (typeof BATTLE_MODES)[number];
export type Language = (typeof LANGUAGES)[number];
export type BattleStatus = (typeof BATTLE_STATUSES)[number];

export type LLMConfig = {
  provider: LLMProvider;
  persona: string;
  name: string;
};

export type BattleConfig = {
  topic: string;
  mode: BattleMode;
  language: Language;
  rounds: number;
  llms: LLMConfig[];
};

export type BattleMessage = {
  provider: LLMProvider;
  name: string;
  content: string;
  round_number: number;
};

export type BattleResponse = {
  id: string;
  status: BattleStatus;
  current_round: number;
  total_rounds: number;
  messages: BattleMessage[];
  error_message: string | null;
};

export const generateBattleTitle = (topic: string): string => {
  const template =
    BATTLE_TITLE_TEMPLATES[Math.floor(Math.random() * BATTLE_TITLE_TEMPLATES.length)];
  const shortTopic = topic.length > 30 ? topic.slice(0, 30) + '...' : topic;
  return template.replace('{topic}', shortTopic);
};
