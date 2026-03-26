import type { DiscoverabilityScore, CompetitorAnalysis, PromptRankingData } from './types';

export function getDiscoverabilityScore(): DiscoverabilityScore {
  return {
    overall: 68,
    maxScore: 100,
    trend: 'up',
    trendDelta: 4,
    categories: [
      { label: 'SEO', score: 72, maxScore: 100 },
      { label: 'Reviews', score: 85, maxScore: 100 },
      { label: 'AI Search', score: 45, maxScore: 100 },
      { label: 'Content', score: 58, maxScore: 100 },
    ],
  };
}

export function getCompetitorAnalysis(): CompetitorAnalysis {
  return {
    yourScore: 68,
    rank: 3,
    totalCompetitors: 6,
    competitors: [
      { name: 'Luxe Hair Studio', score: 82, trend: 'up' },
      { name: 'The Cut Above', score: 76, trend: 'flat' },
      { name: 'Glow & Go Salon', score: 61, trend: 'down' },
      { name: 'Mane Street', score: 54, trend: 'up' },
      { name: 'Shear Bliss', score: 47, trend: 'flat' },
    ],
  };
}

export function getPromptRankings(): PromptRankingData {
  return {
    averagePosition: 3.2,
    totalQueries: 12,
    mentionRate: 58,
    rankings: [
      { query: 'best hair salon near me', position: 2, previousPosition: 3, platform: 'ChatGPT', sentiment: 'positive', lastChecked: '2026-03-19' },
      { query: 'top stylist in Austin', position: 4, previousPosition: 4, platform: 'Gemini', sentiment: 'positive', lastChecked: '2026-03-19' },
      { query: 'hair coloring specialist', position: 3, previousPosition: 5, platform: 'ChatGPT', sentiment: 'positive', lastChecked: '2026-03-18' },
      { query: 'affordable haircut Austin', position: 5, previousPosition: 3, platform: 'Perplexity', sentiment: 'neutral', lastChecked: '2026-03-18' },
      { query: 'bridal hair services', position: 1, previousPosition: 1, platform: 'ChatGPT', sentiment: 'positive', lastChecked: '2026-03-17' },
      { query: 'salon with good reviews', position: 2, previousPosition: 2, platform: 'Gemini', sentiment: 'positive', lastChecked: '2026-03-17' },
    ],
  };
}
