import { tool } from 'ai';
import { z } from 'zod';

export const translateTool = tool({
  description:
    'Translate text between languages using MyMemory translation API. Use this when the user asks to translate something.',
  strict: true,
  inputSchema: z.object({
    text: z.string().describe('The text to translate'),
    from: z
      .string()
      .default('en')
      .describe('Source language code, e.g. "en", "es", "fr", "de", "ja"'),
    to: z.string().describe('Target language code, e.g. "es", "fr", "de", "ja", "zh"'),
  }),
  execute: async ({ text, from, to }) => {
    const langPair = `${from}|${to}`;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`,
    );
    const data = await res.json();

    if (!data.responseData?.translatedText) {
      return { originalText: text, translatedText: null, from, to, error: 'Translation failed' };
    }

    return {
      originalText: text,
      translatedText: data.responseData.translatedText as string,
      from,
      to,
      confidence: data.responseData.match != null
        ? Math.round((data.responseData.match as number) * 100)
        : null,
    };
  },
});
