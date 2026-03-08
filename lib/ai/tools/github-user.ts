import { tool } from 'ai';
import { z } from 'zod';

export const githubUserTool = tool({
  description:
    'Get public profile information for a GitHub user, including bio, repos, followers, and avatar.',
  strict: true,
  inputSchema: z.object({
    username: z.string().describe('GitHub username, e.g. "torvalds", "vercel"'),
  }),
  execute: async ({ username }) => {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'ai-chat-app' },
    });

    if (!res.ok) {
      return { username, error: 'User not found' };
    }

    const data = await res.json();

    return {
      username: data.login,
      name: data.name ?? data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio ?? null,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      location: data.location ?? null,
      company: data.company ?? null,
      blog: data.blog || null,
      profileUrl: data.html_url,
      createdAt: data.created_at,
    };
  },
});
