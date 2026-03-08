import { tool } from 'ai';
import { z } from 'zod';

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export const weatherTool = tool({
  description:
    'Get the current weather conditions for a given city. Use this when the user asks about the weather.',
  strict: true,
  inputSchema: z.object({
    location: z
      .string()
      .describe('City and country code, e.g. "London, GB" or "Tokyo, JP"'),
    unit: z
      .enum(['celsius', 'fahrenheit'])
      .default('celsius')
      .describe('Temperature unit to return'),
  }),
  execute: async ({ location, unit }) => {
    const cityName = location.split(',')[0]?.trim() ?? location;

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`,
    );
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];

    if (!place) {
      return {
        location,
        temperature: null,
        condition: 'Location not found',
        humidity: null,
        unit,
      };
    }

    const tempUnit = unit === 'celsius' ? 'celsius' : 'fahrenheit';
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=${tempUnit}`,
    );
    const weather = await weatherRes.json();
    const current = weather.current;

    return {
      location: `${place.name}, ${place.country_code}`,
      temperature: Math.round(current.temperature_2m),
      condition: WMO_CODES[current.weather_code] ?? 'Unknown',
      humidity: current.relative_humidity_2m,
      unit,
    };
  },
});
