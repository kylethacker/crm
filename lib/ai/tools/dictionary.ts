import { tool } from 'ai';
import { z } from 'zod';

type Meaning = {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
};

export const dictionaryTool = tool({
  description:
    'Look up the definition of an English word, including phonetics, parts of speech, and example usage.',
  strict: true,
  inputSchema: z.object({
    word: z.string().describe('The English word to look up'),
  }),
  execute: async ({ word }) => {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
    );

    if (!res.ok) {
      return { word, phonetic: null, meanings: [], error: 'Word not found' };
    }

    const entries = (await res.json()) as Array<{
      word: string;
      phonetic?: string;
      meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{ definition: string; example?: string }>;
      }>;
    }>;
    const entry = entries[0];

    if (!entry) {
      return { word, phonetic: null, meanings: [], error: 'Word not found' };
    }

    const meanings: Meaning[] = entry.meanings.map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2).map((d) => ({
        definition: d.definition,
        example: d.example,
      })),
    }));

    return {
      word: entry.word,
      phonetic: entry.phonetic ?? null,
      meanings,
    };
  },
});
