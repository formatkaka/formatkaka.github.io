export type Note = {
  text: string;
  date: string;
};

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
  concepts?: number[];
  notes?: Note[];
};

export type Resource = {
  type: 'article' | 'video' | 'project' | 'course' | 'documentation';
  title: string;
  link: string;
  notes?: string;
  completedAt?: string | null;
};

export type Concept = {
  id: number;
  name: string;
  category: string;
  description: string;
  resources: Resource[];
  relatedQuestions: number[];
  confidence: number;
  status: 'learning' | 'practicing' | 'mastered';
  tags: string[];
  created: string;
  lastReviewed: string | null;
  nextReview: string | null;
};

export type TabType = 'all' | 'due' | 'concepts';
