import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { getDailyBriefing } from '@/lib/dashboard/briefing';
import { getScenarioConversations, getScenarioActiveAgents, getScenarioMeta } from '@/lib/demo/scenarios';
import type { ScenarioId } from '@/lib/demo/scenarios';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  await connection();

  const cookieStore = await cookies();
  const scenarioId = (cookieStore.get('crm-demo-scenario')?.value ?? 'busy') as ScenarioId;
  const meta = getScenarioMeta(scenarioId);

  const briefing = getDailyBriefing({
    scenarioId,
    conversations: getScenarioConversations(scenarioId),
    activeAgentOverrides: getScenarioActiveAgents(scenarioId),
    ownerName: meta.ownerName,
  });

  return <DashboardGrid briefing={briefing} />;
}
