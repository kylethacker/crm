import { tool } from 'ai';
import { z } from 'zod';

export const exchangeRateTool = tool({
  description:
    'Convert between currencies using live exchange rates. Use this when the user asks about currency conversion or exchange rates.',
  strict: true,
  inputSchema: z.object({
    amount: z.number().positive().describe('The amount to convert'),
    from: z
      .string()
      .length(3)
      .describe('Source currency code, e.g. "USD", "EUR", "GBP"'),
    to: z
      .string()
      .length(3)
      .describe('Target currency code, e.g. "EUR", "JPY", "GBP"'),
  }),
  execute: async ({ amount, from, to }) => {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&amount=${amount}`,
    );

    if (!res.ok) {
      return { amount, from: fromCode, to: toCode, result: null, rate: null, error: 'Conversion failed — check currency codes' };
    }

    const data = await res.json();
    const converted = data.rates?.[toCode];

    if (converted == null) {
      return { amount, from: fromCode, to: toCode, result: null, rate: null, error: 'Currency not supported' };
    }

    return {
      amount,
      from: fromCode,
      to: toCode,
      result: Math.round(converted * 100) / 100,
      rate: Math.round((converted / amount) * 1_000_000) / 1_000_000,
      date: data.date as string,
    };
  },
});
