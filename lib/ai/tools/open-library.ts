import { tool } from 'ai';
import { z } from 'zod';

export const openLibraryTool = tool({
  description:
    'Search for books using Open Library. Returns title, author, year, and cover info. Use when the user asks about books.',
  strict: true,
  inputSchema: z.object({
    query: z.string().describe('Book title, author name, or ISBN to search for'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(5)
      .default(3)
      .describe('Number of results to return (1-5)'),
  }),
  execute: async ({ query, limit }) => {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,cover_i,number_of_pages_median,subject,key`,
    );
    const data = await res.json();

    const books = (data.docs as Array<Record<string, unknown>>)?.map((doc) => ({
      title: doc.title as string,
      author: (doc.author_name as string[])?.[0] ?? 'Unknown',
      year: (doc.first_publish_year as number) ?? null,
      pages: (doc.number_of_pages_median as number) ?? null,
      subjects: ((doc.subject as string[]) ?? []).slice(0, 3),
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      openLibraryUrl: `https://openlibrary.org${doc.key}`,
    })) ?? [];

    return { query, results: books, totalFound: data.numFound as number };
  },
});
