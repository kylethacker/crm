'use client';

import { useRouter } from 'next/navigation';
import type { TeamReport, TeamGap } from '@/lib/dashboard/briefing';
import { useChatHistory } from '@/lib/chat/chat-history-context';

type TeamBriefingCardProps = {
  reports: TeamReport[];
  gaps: TeamGap[];
  pendingApprovals: number;
};

export function TeamBriefingCard({ reports, gaps, pendingApprovals }: TeamBriefingCardProps) {
  const router = useRouter();
  const { createSession } = useChatHistory();

  const hasContent = reports.length > 0 || gaps.length > 0 || pendingApprovals > 0;

  const openChat = (message: string) => {
    createSession({ initialMessage: message });
    router.push('/chat');
  };

  return (
    <div className="flex min-h-[120px] w-full flex-col rounded-xl border border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Agent Updates
      </h3>

      {!hasContent ? (
        <p className="mt-auto text-sm text-neutral-400 dark:text-neutral-500">
          No agents active yet
        </p>
      ) : (
        <>
          {/* Pending approvals */}
          {pendingApprovals > 0 && (
            <button
              type="button"
              onClick={() => openChat(`Show me the ${pendingApprovals} action${pendingApprovals !== 1 ? 's' : ''} waiting for my approval.`)}
              className="mt-2.5 cursor-pointer rounded-lg bg-amber-50 px-3 py-2 text-left transition-colors hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
            >
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                {pendingApprovals} action{pendingApprovals !== 1 ? 's' : ''} need approval
              </p>
            </button>
          )}

          {/* Agent reports */}
          {reports.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {reports.map((r) => (
                <div key={r.agentName} className="flex items-center gap-2">
                  <span className="text-sm">{r.icon}</span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    <span className="font-medium">{r.agentName}</span>
                    <span className="text-neutral-500 dark:text-neutral-400"> — {r.outcome}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Gap recommendations */}
          {gaps.length > 0 && (
            <div className="mt-2.5 border-t border-dashed border-neutral-200 pt-2.5 dark:border-neutral-800">
              {gaps.map((gap) => (
                <button
                  key={gap.agentName}
                  type="button"
                  onClick={() => openChat(gap.prompt)}
                  className="mt-1 cursor-pointer text-left text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  Nobody&apos;s handling: &ldquo;{gap.problem}&rdquo; →
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
