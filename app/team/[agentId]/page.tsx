import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { agentDefinitions } from '@/lib/marketplace/data';
import { AgentDetail } from '@/components/team/agent-detail';

type Params = { agentId: string };

export function generateStaticParams() {
  return agentDefinitions.map((a) => ({ agentId: a.id }));
}

export default async function AgentDetailPage({ params }: { params: Promise<Params> }) {
  const { agentId } = await params;
  const def = agentDefinitions.find((a) => a.id === agentId);
  if (!def) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-neutral-400 dark:text-neutral-600">
          Loading…
        </div>
      }
    >
      <AgentDetail agentDef={def} />
    </Suspense>
  );
}
