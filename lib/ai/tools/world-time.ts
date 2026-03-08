import { tool } from 'ai';
import { z } from 'zod';

export const worldTimeTool = tool({
  description:
    'Get the current time in a specific timezone. Use this when the user asks what time it is somewhere.',
  strict: true,
  inputSchema: z.object({
    timezone: z
      .string()
      .describe(
        'IANA timezone identifier, e.g. "America/New_York", "Europe/London", "Asia/Tokyo"',
      ),
  }),
  execute: async ({ timezone }) => {
    const res = await fetch(
      `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`,
    );

    if (!res.ok) {
      return { timezone, datetime: null, abbreviation: null, utcOffset: null, error: 'Invalid timezone' };
    }

    const data = await res.json();

    return {
      timezone: data.timezone as string,
      datetime: data.datetime as string,
      abbreviation: data.abbreviation as string,
      utcOffset: data.utc_offset as string,
    };
  },
});
