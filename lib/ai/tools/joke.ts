import { tool } from 'ai';
import { z } from 'zod';

export const jokeTool = tool({
  description:
    'Get a random joke, optionally filtered by category. Use this when the user asks for a joke or wants to be entertained.',
  strict: true,
  inputSchema: z.object({
    category: z
      .enum(['Any', 'Programming', 'Misc', 'Dark', 'Pun', 'Spooky', 'Christmas'])
      .default('Any')
      .describe('Joke category'),
  }),
  execute: async ({ category }) => {
    const res = await fetch(
      `https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,racist,sexist`,
    );
    const data = await res.json();

    if (data.error) {
      return { type: 'single' as const, joke: 'No joke found — try another category.', category };
    }

    if (data.type === 'twopart') {
      return { type: 'twopart' as const, setup: data.setup, delivery: data.delivery, category: data.category };
    }

    return { type: 'single' as const, joke: data.joke, category: data.category };
  },
});
