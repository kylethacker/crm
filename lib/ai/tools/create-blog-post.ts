import { tool } from 'ai';
import { z } from 'zod';

export const createBlogPostTool = tool({
  description:
    'Create a new blog post for the business. Use this when the agent needs to produce a blog post draft or publish a post.',
  strict: true,
  inputSchema: z.object({
    title: z.string().describe('Blog post title'),
    content: z.string().describe('Full blog post content in markdown'),
    excerpt: z
      .string()
      .describe('Short excerpt/summary for previews (1-2 sentences)'),
    tags: z.array(z.string()).describe('Topic tags for categorization'),
  }),
  execute: async ({ title, content, excerpt, tags }) => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
      id: crypto.randomUUID(),
      title,
      content,
      excerpt,
      tags,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      wordCount,
    };
  },
});
