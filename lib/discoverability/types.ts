export type ScoreCategory = {
  label: string;
  score: number;
  maxScore: number;
};

export type DiscoverabilityScore = {
  overall: number;
  maxScore: number;
  trend: 'up' | 'down' | 'flat';
  trendDelta: number;
  categories: ScoreCategory[];
};

export type Competitor = {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'flat';
};

export type CompetitorAnalysis = {
  yourScore: number;
  rank: number;
  totalCompetitors: number;
  competitors: Competitor[];
};

export type PromptRanking = {
  query: string;
  position: number;
  previousPosition: number;
  platform: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  lastChecked: string;
};

export type PromptRankingData = {
  averagePosition: number;
  totalQueries: number;
  mentionRate: number;
  rankings: PromptRanking[];
};
