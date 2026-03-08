import { tool } from 'ai';
import { z } from 'zod';

export const countryInfoTool = tool({
  description:
    'Get key facts about a country: capital, population, region, languages, currencies, and flag.',
  strict: true,
  inputSchema: z.object({
    country: z.string().describe('The country name, e.g. "Japan", "Brazil", "France"'),
  }),
  execute: async ({ country }) => {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,capital,population,region,subregion,languages,currencies,flags,flag`,
    );

    if (!res.ok) {
      return { country, name: null, capital: null, population: null, region: null, languages: null, currencies: null, flag: null, error: 'Country not found' };
    }

    const results = (await res.json()) as Array<{
      name: { common: string; official: string };
      capital?: string[];
      population: number;
      region: string;
      subregion?: string;
      languages?: Record<string, string>;
      currencies?: Record<string, { name: string; symbol: string }>;
      flag?: string;
    }>;
    const data = results[0];

    if (!data) {
      return { country, name: null, capital: null, population: null, region: null, languages: null, currencies: null, flag: null, error: 'Country not found' };
    }

    const currencies = data.currencies
      ? Object.values(data.currencies)
          .map((c) => `${c.name} (${c.symbol})`)
          .join(', ')
      : null;

    const languages = data.languages ? Object.values(data.languages).join(', ') : null;

    return {
      name: data.name.common,
      officialName: data.name.official,
      capital: data.capital?.[0] ?? null,
      population: data.population,
      region: data.region,
      subregion: data.subregion ?? null,
      languages,
      currencies,
      flag: data.flag ?? null,
    };
  },
});
