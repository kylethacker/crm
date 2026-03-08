import { weatherTool } from './weather';
import { wikipediaTool } from './wikipedia';
import { calculateTool } from './calculate';
import { dictionaryTool } from './dictionary';
import { worldTimeTool } from './world-time';
import { cryptoPriceTool } from './crypto-price';
import { exchangeRateTool } from './exchange-rate';
import { countryInfoTool } from './country-info';
import { hackerNewsTool } from './hacker-news';
import { unitConverterTool } from './unit-converter';
import { qrCodeTool } from './qr-code';
import { jokeTool } from './joke';
import { dadJokeTool } from './dad-joke';
import { translateTool } from './translate';
import { ipGeolocationTool } from './ip-geolocation';
import { colorInfoTool } from './color-info';
import { githubUserTool } from './github-user';
import { numberFactTool } from './number-fact';
import { randomFactTool } from './random-fact';
import { openLibraryTool } from './open-library';

/**
 * All available tools, keyed by the name the model sees.
 *
 * Scalability notes:
 * - Every tool here is free (no API key required).
 * - Tools that return simple key-value data don't need a custom renderer —
 *   the ToolOutputFallback component handles them automatically.
 * - Only create a custom renderer in tool-renderers/ when the data benefits
 *   from rich UI (color swatches, avatars, links, special formatting).
 * - At 100+ tools, consider grouping into subdirectories by domain and
 *   merging the exports here, or using dynamic tool selection per query.
 *
 * @see https://v6.ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
 */
export const tools = {
  // --- Information & Knowledge ---
  searchWikipedia: wikipediaTool,
  defineWord: dictionaryTool,
  getCountryInfo: countryInfoTool,
  searchOpenLibrary: openLibraryTool,
  getGitHubUser: githubUserTool,

  // --- Weather & Location ---
  getWeather: weatherTool,
  getWorldTime: worldTimeTool,
  getIPGeolocation: ipGeolocationTool,

  // --- Finance ---
  getCryptoPrice: cryptoPriceTool,
  getExchangeRate: exchangeRateTool,

  // --- Math & Conversion ---
  calculate: calculateTool,
  convertUnits: unitConverterTool,

  // --- Language ---
  translateText: translateTool,

  // --- Fun & Trivia ---
  getJoke: jokeTool,
  getDadJoke: dadJokeTool,
  getRandomFact: randomFactTool,
  getNumberFact: numberFactTool,

  // --- Utilities ---
  generateQRCode: qrCodeTool,
  getColorInfo: colorInfoTool,

  // --- News ---
  getTopHackerNews: hackerNewsTool,
};

export type AppTools = typeof tools;
