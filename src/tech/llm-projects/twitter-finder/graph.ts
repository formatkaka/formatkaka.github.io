import { StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import type { TwitterClient, Account, Hashtag } from './twitterClient';

const llm = new ChatOpenAI({
  model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
});

const builder = new StateGraph<GraphState>({
  channels: {
    complaintText: null,
    city: null,
    country: null,
    intent: null,
    searchResults: null,
    rankedResults: null,
  },
});

builder.addNode('intent', async (state) => {
  const { complaintText, city, country } = state;

  const prompt = [
    {
      role: 'system',
      content:
        'You help map citizen complaints to Twitter search intents. Return a compact JSON object.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        complaintText,
        city,
        country,
      }),
    },
  ];

  const response = await llm.invoke(prompt);
  const parsed = safeJsonParse<Intent>(response.content);

  return {
    ...state,
    intent: parsed,
  };
});

builder.addNode('search', async (state, { twitterClient }) => {
  if (!state.intent) {
    return state;
  }

  const queryParts = [
    state.intent.issueCategory,
    ...state.intent.entities,
    ...state.intent.keywords,
  ].filter(Boolean);

  const query = queryParts.join(' ');
  const location = state.intent.location.city || state.city;

  const [accounts, hashtags] = await Promise.all([
    twitterClient.searchUsers(query, location),
    twitterClient.searchHashtags(query),
  ]);

  return {
    ...state,
    searchResults: {
      accounts,
      hashtags,
    },
  };
});

builder.addNode('rank', async (state) => {
  if (!state.searchResults) {
    return state;
  }

  const accounts = [...state.searchResults.accounts].sort((a, b) => b.score - a.score);

  const withExplainers = accounts.map((account) => ({
    ...account,
    explanation: account.explanation,
  }));

  return {
    ...state,
    rankedResults: {
      accounts: withExplainers,
      hashtags: state.searchResults.hashtags,
    },
  };
});

builder.addEdge('__start__', 'intent');
builder.addEdge('intent', 'search');
builder.addEdge('search', 'rank');
builder.addEdge('rank', '__end__');

export const twitterFinderGraph = builder.compile();

export async function runTwitterFinder(input: TwitterFinderInput, twitterClient: TwitterClient) {
  const result = await twitterFinderGraph.invoke(
    {
      complaintText: input.complaintText,
      city: input.city,
      country: input.country,
      intent: null,
      searchResults: null,
      rankedResults: null,
    },
    {
      configurable: {
        twitterClient,
      },
    }
  );

  return {
    accounts: result.rankedResults?.accounts ?? [],
    hashtags: result.rankedResults?.hashtags ?? [],
  };
}

function safeJsonParse<T>(value: unknown): T | null {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

type TwitterFinderInput = {
  complaintText: string;
  city: string;
  country?: string;
};

type Intent = {
  issueCategory: string;
  entities: string[];
  keywords: string[];
  location: {
    city: string;
    country?: string;
  };
};

type Account = {
  handle: string;
  displayName: string;
  role: string;
  explanation: string;
  score: number;
};

type GraphState = {
  complaintText: string;
  city: string;
  country?: string;
  intent: Intent | null;
  searchResults:
    | {
        accounts: Account[];
        hashtags: Hashtag[];
      }
    | null;
  rankedResults:
    | {
        accounts: Account[];
        hashtags: Hashtag[];
      }
    | null;
};

type Hashtag = {
  tag: string;
  explanation: string;
  score: number;
};

