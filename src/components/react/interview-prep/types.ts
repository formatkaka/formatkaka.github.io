export type Problem = {
  id: number;
  name: string;
  link: string;
  difficulty: string;
  itemType: string;
  topic: string;
  company: string;
  confidence: number;
  status: string;
  attempts: number;
  lastSolved: string | null;
  nextReview: string | null;
  created: string;
};

export type TabType = 'all' | 'due';
