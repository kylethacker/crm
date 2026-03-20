import type { DailyBriefing } from '@/lib/dashboard/briefing';
import { buildQueuePrompt } from '@/lib/chat/queue-prompt';
import { PromptCard } from './prompt-card';
import { TeamBriefingCard } from './cards/team-briefing-card';

export function DailyBriefingHeader({ greeting }: { greeting: string }) {
  return (
    <div className="col-span-full">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {greeting}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Here&apos;s what needs your attention today.
      </p>
    </div>
  );
}

export function BriefingCards({ briefing }: { briefing: DailyBriefing }) {
  return (
    <>
      <PromptCard
        title="Customers waiting"
        labels={briefing.urgentItems.map((i) => i.label)}
        emptyText="All caught up"
        cta="Respond to all"
        prompt={buildQueuePrompt({
          header: `I have ${briefing.urgentItems.length} customer conversation${briefing.urgentItems.length !== 1 ? 's' : ''} waiting for a reply:`,
          items: briefing.urgentItems.map((i) => ({ label: i.label, detail: i.detail })),
          steps: [
            'Work through these one at a time. For each customer:',
            '1. Look up the contact and show me the context',
            '2. Draft a response using the draftMessage tool',
            '3. Stop and wait for my response before moving to the next one',
          ],
        })}
      />

      <PromptCard
        title="Today's Schedule"
        labels={briefing.todaySchedule.map((i) => i.label)}
        emptyText="No appointments today"
        cta="Prepare for today"
        prompt={buildQueuePrompt({
          header: `I have ${briefing.todaySchedule.length} appointment${briefing.todaySchedule.length !== 1 ? 's' : ''} today:`,
          items: briefing.todaySchedule.map((i) => ({ label: i.label, detail: i.detail })),
          steps: [
            'Prep me for these one at a time. For each appointment:',
            '1. Pull up the contact and summarize our relationship',
            '2. Suggest talking points and any open items to address',
            '3. Stop and wait for my response before moving to the next one',
          ],
        })}
      />

      <PromptCard
        title="Follow Up"
        labels={briefing.followUps.map((i) => i.label)}
        cta="Draft follow-ups"
        prompt={buildQueuePrompt({
          header: `I have ${briefing.followUps.length} contact${briefing.followUps.length !== 1 ? 's' : ''} to follow up with:`,
          items: briefing.followUps.map((i) => ({ label: i.label, detail: i.detail })),
          steps: [
            'Work through these one at a time, starting with the most overdue. For each contact:',
            '1. Look up the contact and show me what we last discussed',
            '2. Draft a short, personal check-in message using the draftMessage tool',
            '3. Stop and wait for my response before moving to the next one',
          ],
        })}
      />

      <TeamBriefingCard
        reports={briefing.teamReports}
        gaps={briefing.teamGaps}
        pendingApprovals={briefing.pendingApprovals}
      />
    </>
  );
}
