import { connection } from 'next/server';
import { getDiscoverabilityScore, getCompetitorAnalysis, getPromptRankings } from '@/lib/discoverability/stats';
import { DiscoverabilityGrid } from '@/components/discoverability/discoverability-grid';

export const metadata = {
  title: 'Discoverability',
};

export default async function DiscoverabilityPage() {
  await connection();
  const score = getDiscoverabilityScore();
  const competitors = getCompetitorAnalysis();
  const promptRankings = getPromptRankings();

  return (
    <DiscoverabilityGrid
      score={score}
      competitors={competitors}
      promptRankings={promptRankings}
    />
  );
}
