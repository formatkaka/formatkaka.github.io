// LangChain/LangGraph imports are commented out until the project moves to a
// server runtime (e.g. Node adapter, Vercel, Netlify) that can support them.
// The Twitter Finder UI continues to work via the mock data in twitterClient.ts.

// import { StateGraph } from '@langchain/langgraph';
// import { ChatOpenAI } from '@langchain/openai';
import type { TwitterClient } from './twitterClient';

export async function runTwitterFinder(input: TwitterFinderInput, twitterClient: TwitterClient) {
  const queryParts = [input.complaintText, input.city].filter(Boolean);
  const query = queryParts.join(' ');

  const [accounts, hashtags] = await Promise.all([
    twitterClient.searchUsers(query, input.city),
    twitterClient.searchHashtags(query),
  ]);

  return {
    accounts: [...accounts].sort((a, b) => b.score - a.score),
    hashtags,
  };
}

type TwitterFinderInput = {
  complaintText: string;
  city: string;
  country?: string;
};
