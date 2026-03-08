import { tool } from 'ai';
import { z } from 'zod';

type WikiResult = {
  title: string;
  extract: string;
  url: string | null;
  thumbnail: string | null;
};

function toResult(data: Record<string, unknown>): WikiResult {
  const urls = data.content_urls as Record<string, Record<string, string>> | undefined;
  const thumb = data.thumbnail as Record<string, string> | undefined;

  return {
    title: typeof data.title === 'string' ? data.title : '',
    extract: typeof data.extract === 'string' ? data.extract : '',
    url: urls?.desktop?.page ?? null,
    thumbnail: thumb?.source ?? null,
  };
}

const NOT_FOUND: WikiResult = { title: '', extract: 'No Wikipedia article found.', url: null, thumbnail: null };

export const wikipediaTool = tool({
  description:
    'Search Wikipedia and return a summary of the matching article. Use this when the user asks about a topic, person, place, or concept.',
  strict: true,
  inputSchema: z.object({
    query: z.string().describe('The topic to search for on Wikipedia'),
  }),
  execute: async ({ query }) => {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    );

    if (res.ok) return toResult(await res.json());

    // Fallback: search for the closest matching title
    const fallback = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`,
    );
    const [, titles] = (await fallback.json()) as [string, string[]];
    const firstTitle = titles[0];
    if (!firstTitle) return { ...NOT_FOUND, title: query };

    const retryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`,
    );
    if (!retryRes.ok) return { ...NOT_FOUND, title: query };

    return toResult(await retryRes.json());
  },
});
