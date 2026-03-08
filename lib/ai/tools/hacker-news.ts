import { tool } from 'ai';
import { z } from 'zod';

type HNItem = {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  descendants?: number;
};

export const hackerNewsTool = tool({
  description:
    'Get the current top stories from Hacker News. Use this when the user asks about tech news or trending stories.',
  strict: true,
  inputSchema: z.object({
    count: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe('Number of top stories to return (1-10)'),
  }),
  execute: async ({ count }) => {
    const idsRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
    );
    const ids = (await idsRes.json()) as number[];
    const topIds = ids.slice(0, count);

    const stories = await Promise.all(
      topIds.map(async (id) => {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        );
        const item = (await res.json()) as HNItem;
        return {
          title: item.title,
          url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
          score: item.score,
          author: item.by,
          commentCount: item.descendants ?? 0,
        };
      }),
    );

    return { stories };
  },
});
