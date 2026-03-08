import { tool } from 'ai';
import { z } from 'zod';

export const randomFactTool = tool({
  description:
    'Get a random interesting or useless fact. Great for fun trivia and conversation starters.',
  strict: true,
  inputSchema: z.object({
    language: z
      .enum(['en', 'de'])
      .default('en')
      .describe('Language for the fact'),
  }),
  execute: async ({ language }) => {
    const res = await fetch(
      `https://uselessfacts.jsph.pl/api/v2/facts/random?language=${language}`,
    );
    const data = await res.json();

    return {
      fact: data.text as string,
      source: data.source as string,
      sourceUrl: data.source_url as string,
    };
  },
});
