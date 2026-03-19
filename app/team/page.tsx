import { activeAgents, getAgentDef, availableAgents, getPendingApprovals } from '@/lib/marketplace/data';
import type { AgentDefinition, ActiveAgent } from '@/lib/marketplace/types';
import { TeamRoster } from '@/components/team/team-roster';

export const metadata = {
  title: 'Your Team',
};

export default function TeamPage() {
  const hired = activeAgents
    .map((a) => ({ active: a, def: getAgentDef(a.agentId) }))
    .filter((h): h is { active: ActiveAgent; def: AgentDefinition } => h.def != null);

  const pending = getPendingApprovals();

  return <TeamRoster hired={hired} available={availableAgents} pendingCount={pending.length} />;
}
