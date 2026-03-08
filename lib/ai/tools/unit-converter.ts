import { tool } from 'ai';
import { z } from 'zod';

const CONVERSIONS: Record<string, Record<string, number>> = {
  // Length (base: meters)
  m: { m: 1 }, km: { m: 1000 }, cm: { m: 0.01 }, mm: { m: 0.001 },
  in: { m: 0.0254 }, ft: { m: 0.3048 }, yd: { m: 0.9144 }, mi: { m: 1609.344 },
  // Weight (base: grams)
  g: { g: 1 }, kg: { g: 1000 }, mg: { g: 0.001 },
  lb: { g: 453.592 }, oz: { g: 28.3495 },
  // Volume (base: liters)
  l: { l: 1 }, ml: { l: 0.001 },
  gal: { l: 3.78541 }, qt: { l: 0.946353 }, cup: { l: 0.236588 }, floz: { l: 0.0295735 },
  // Speed (base: m/s)
  'km/h': { 'm/s': 0.277778 }, 'mph': { 'm/s': 0.44704 }, 'm/s': { 'm/s': 1 }, kn: { 'm/s': 0.514444 },
  // Data (base: bytes)
  b: { b: 1 }, kb: { b: 1024 }, mb: { b: 1048576 }, gb: { b: 1073741824 }, tb: { b: 1099511627776 },
};

function convert(value: number, from: string, to: string): number | null {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  // Temperature special cases
  if (
    (fromLower === 'c' || fromLower === 'f' || fromLower === 'k') &&
    (toLower === 'c' || toLower === 'f' || toLower === 'k')
  ) {
    return convertTemperature(value, fromLower, toLower);
  }

  const fromEntry = CONVERSIONS[fromLower];
  const toEntry = CONVERSIONS[toLower];
  if (!fromEntry || !toEntry) return null;

  const fromBase = Object.keys(fromEntry)[0];
  const toBase = Object.keys(toEntry)[0];
  if (!fromBase || !toBase || fromBase !== toBase) return null;

  const fromFactor = fromEntry[fromBase];
  const toFactor = toEntry[toBase];
  if (fromFactor == null || toFactor == null) return null;

  return (value * fromFactor) / toFactor;
}

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === 'c') celsius = value;
  else if (from === 'f') celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

export const unitConverterTool = tool({
  description:
    'Convert between units of measurement. Supports length (m, km, ft, mi, in, etc.), weight (kg, lb, oz, g), volume (l, gal, cup, floz), speed (km/h, mph, m/s), temperature (C, F, K), and data (B, KB, MB, GB, TB).',
  strict: true,
  inputSchema: z.object({
    value: z.number().describe('The numeric value to convert'),
    from: z.string().describe('Source unit, e.g. "kg", "mi", "F", "GB"'),
    to: z.string().describe('Target unit, e.g. "lb", "km", "C", "MB"'),
  }),
  execute: async ({ value, from, to }) => {
    const result = convert(value, from, to);

    if (result === null) {
      return { value, from, to, result: null, error: `Cannot convert from "${from}" to "${to}"` };
    }

    const rounded = Math.round(result * 1_000_000) / 1_000_000;

    return { value, from, to, result: rounded };
  },
});
