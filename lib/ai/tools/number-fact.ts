import { tool } from 'ai';
import { z } from 'zod';

export const numberFactTool = tool({
  description:
    'Get an interesting fact about a number. Supports trivia, math, date, and year categories.',
  strict: true,
  inputSchema: z.object({
    number: z.number().int().describe('The number to get a fact about'),
    type: z
      .enum(['trivia', 'math', 'date', 'year'])
      .default('trivia')
      .describe('Type of fact to retrieve'),
  }),
  execute: async ({ number, type }) => {
    const res = await fetch(`http://numbersapi.com/${number}/${type}?json`);
    const data = await res.json();

    return {
      number,
      type,
      fact: data.text as string,
      found: data.found as boolean,
    };
  },
});
