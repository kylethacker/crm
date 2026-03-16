import { generateObject } from 'ai';
import { z } from 'zod';
import { fastModel } from '@/lib/ai/gateway';
import type { CrmStats, AgentActivityStats, DashboardInsights } from './types';

const CARD_DESCRIPTIONS = `Available dashboard cards (by ID):
- attention: Items needing the owner's action (approvals, failures)
- agent-activity: Recent activity feed across all agents
- credits: Credit usage breakdown by agent
- contacts: Contact count breakdown by status (customer, lead, prospect)
- revenue: Total revenue from completed bookings with recent payments
- bookings: List of upcoming scheduled bookings
- messages: Inbound vs outbound message volume
- website-analytics: Website traffic, page views, bounce rate, and traffic sources`;

const insightsSchema = z.object({
  summary: z
    .string()
    .describe('A single concise sentence summarizing the most important takeaway from the data'),
  cards: z
    .array(
      z.object({
        cardId: z
          .string()
          .describe('The card ID to surface'),
        reason: z
          .string()
          .describe('A brief phrase (max 8 words) explaining why this card matters right now'),
      }),
    )
    .min(3)
    .max(5)
    .describe('The 3-5 most relevant cards to show, ordered by priority'),
});

function summarizeStats(crm: CrmStats, activity: AgentActivityStats): string {
  return `Business Data:
- ${crm.totalContacts} contacts: ${crm.contactsByStatus.customer} customers, ${crm.contactsByStatus.lead} leads, ${crm.contactsByStatus.prospect} prospects
- ${crm.totalMessages} messages: ${crm.inboundMessages} inbound, ${crm.outboundMessages} outbound
- $${crm.totalRevenue.toLocaleString()} total revenue from ${crm.revenuePayments.length} payments
- ${crm.upcomingBookings.length} upcoming bookings, ${crm.bookingsByStatus.completed} completed, ${crm.bookingsByStatus.cancelled} cancelled, ${crm.bookingsByStatus['no-show']} no-shows

Agent Activity:
- ${activity.totalActivities} total events, ${activity.totalCredits} credits used
- ${activity.byStatus.completed} completed, ${activity.byStatus.running} running, ${activity.byStatus['needs-approval']} need approval, ${activity.byStatus.failed} failed
- ${activity.needsAttention.length} items need owner attention
- Top agents by credits: ${activity.creditsByAgent.slice(0, 3).map((a) => `${a.agentName} (${a.credits} cr)`).join(', ')}`;
}

export async function getDashboardInsights(
  crmStats: CrmStats,
  activityStats: AgentActivityStats,
): Promise<DashboardInsights | null> {
  try {
    const { object } = await generateObject({
      model: fastModel,
      schema: insightsSchema,
      system: `You are a business dashboard analyst for a small service-based business that uses AI agents to automate tasks. Given current business metrics and agent activity, decide which 3-5 dashboard cards are most important to show right now. Always include "attention" if there are items needing attention. Prioritize cards that reveal actionable insights. Keep reasons extremely brief.\n\n${CARD_DESCRIPTIONS}`,
      prompt: summarizeStats(crmStats, activityStats),
    });

    return object;
  } catch {
    return null;
  }
}
