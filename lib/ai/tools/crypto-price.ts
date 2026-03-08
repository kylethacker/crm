import { tool } from 'ai';
import { z } from 'zod';

export const cryptoPriceTool = tool({
  description:
    'Get the current price of a cryptocurrency in USD, including 24-hour change. Use this when the user asks about crypto prices.',
  strict: true,
  inputSchema: z.object({
    coinId: z
      .string()
      .describe(
        'The CoinGecko coin ID, e.g. "bitcoin", "ethereum", "solana", "dogecoin"',
      ),
  }),
  execute: async ({ coinId }) => {
    const id = coinId.toLowerCase();
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
    );

    if (!res.ok) {
      return { coinId: id, priceUsd: null, change24h: null, marketCap: null, error: 'Coin not found' };
    }

    const data = await res.json();
    const coin = data[id];

    if (!coin) {
      return { coinId: id, priceUsd: null, change24h: null, marketCap: null, error: 'Coin not found' };
    }

    return {
      coinId: id,
      priceUsd: coin.usd as number,
      change24h: Math.round((coin.usd_24h_change as number) * 100) / 100,
      marketCap: coin.usd_market_cap as number,
    };
  },
});
