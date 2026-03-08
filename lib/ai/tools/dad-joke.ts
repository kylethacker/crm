import { tool } from 'ai';
import { z } from 'zod';

export const dadJokeTool = tool({
  description:
    'Get a random dad joke, or search for dad jokes by keyword. Great for a quick laugh.',
  strict: true,
  inputSchema: z.object({
    searchTerm: z
      .string()
      .default('')
      .describe('Optional search term to find jokes about a specific topic'),
  }),
  execute: async ({ searchTerm }) => {
    const headers = { Accept: 'application/json' };

    if (searchTerm) {
      const res = await fetch(
        `https://icanhazdadjoke.com/search?term=${encodeURIComponent(searchTerm)}&limit=3`,
        { headers },
      );
      const data = await res.json();
      const jokes = (data.results as Array<{ joke: string }>)?.map((r) => r.joke) ?? [];
      return { searchTerm, jokes, total: data.total_jokes as number };
    }

    const res = await fetch('https://icanhazdadjoke.com/', { headers });
    const data = await res.json();
    return { joke: data.joke as string };
  },
});
