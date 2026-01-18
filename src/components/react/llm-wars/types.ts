// Import personas from shared JSON (single source of truth for frontend + backend)
import sharedPersonas from '../../../tech/llm-projects/1-llm-wars/shared/personas.json';

export const LLM_PROVIDERS = ['openai', 'claude', 'grok'] as const;
export const BATTLE_MODES = ['text', 'emoji'] as const;
export const BATTLE_STATUSES = ['pending', 'in_progress', 'completed', 'error'] as const;

export const PRESET_TOPICS = [
  { id: 'pineapple-pizza', label: 'Pineapple on pizza: Yes or No?' },
  { id: 'hotdog-sandwich', label: 'Is a hot dog a sandwich?' },
  { id: 'tabs-spaces', label: 'Tabs vs Spaces' },
  { id: 'ios-android', label: 'iOS vs Android' },
  { id: 'star-wars-trek', label: 'Star Wars vs Star Trek' },
  { id: 'ai-programmers', label: 'Should AI replace programmers?' },
  { id: 'cereal-soup', label: 'Is cereal a soup?' },
  { id: 'best-language', label: 'Best programming language' },
  { id: 'cats-dogs', label: 'Cats vs Dogs' },
  { id: 'marvel-dc', label: 'Marvel vs DC' },
  { id: 'coffee-tea', label: 'Coffee vs Tea' },
  { id: 'remote-office', label: 'Remote work vs Office' },
  { id: 'bitcoin-gold', label: 'Bitcoin vs Gold' },
  { id: 'mac-pc', label: 'Mac vs PC' },
  { id: 'vim-emacs', label: 'Vim vs Emacs' },
  { id: 'light-dark-mode', label: 'Light mode vs Dark mode' },
  { id: 'chocolate-vanilla', label: 'Chocolate vs Vanilla' },
  { id: 'summer-winter', label: 'Summer vs Winter' },
  { id: 'books-movies', label: 'Books vs Movies' },
  { id: 'beach-mountains', label: 'Beach vs Mountains' },
  { id: 'morning-night', label: 'Morning person vs Night owl' },
  { id: 'pizza-burger', label: 'Pizza vs Burgers' },
  { id: 'gif-jif', label: 'Is it GIF or JIF?' },
  { id: 'toilet-paper', label: 'Toilet paper: Over or Under?' },
  { id: 'water-wet', label: 'Is water wet?' },
] as const;

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
  openai: '#5ba37f',  // Soft green
  claude: '#d4896a',  // Soft coral (matches blog accent)
  grok: '#7b9fc4',    // Soft blue
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
}[];

export const CUSTOM_PERSONA_ID = 'custom';

export type LLMProvider = (typeof LLM_PROVIDERS)[number];
export type BattleMode = (typeof BATTLE_MODES)[number];
export type BattleStatus = (typeof BATTLE_STATUSES)[number];

export type LLMConfig = {
  provider: LLMProvider;
  persona: string;
  name: string;
};

export type BattleConfig = {
  topic: string;
  mode: BattleMode;
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
  const template = BATTLE_TITLE_TEMPLATES[
    Math.floor(Math.random() * BATTLE_TITLE_TEMPLATES.length)
  ];
  const shortTopic = topic.length > 30 ? topic.slice(0, 30) + '...' : topic;
  return template.replace('{topic}', shortTopic);
};
