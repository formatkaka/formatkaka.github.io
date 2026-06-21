import type { APIRoute } from 'astro';
import { MockTwitterClient } from '../../../tech/llm-projects/twitter-finder/twitterClient';
import { runTwitterFinder } from '../../../tech/llm-projects/twitter-finder/graph';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.complaintText !== 'string' || typeof body.city !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body. Expected { complaintText: string, city: string }',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const twitterClient = new MockTwitterClient();

    const result = await runTwitterFinder(
      {
        complaintText: body.complaintText,
        city: body.city,
        country: typeof body.country === 'string' ? body.country : undefined,
      },
      twitterClient
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('twitter-finder search error', error);

    return new Response(
      JSON.stringify({
        error: 'Something went wrong while searching for Twitter accounts.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
