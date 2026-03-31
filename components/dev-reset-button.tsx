'use client';

import { useActivityResolutions } from '@/lib/activity/use-resolutions';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { useScenario } from '@/lib/demo/scenario-context';
import { SCENARIOS } from '@/lib/demo/scenarios';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const btnClass =
  'cursor-pointer rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-500 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300';

const activeBtnClass =
  'border-neutral-900 bg-neutral-200 text-neutral-950 hover:bg-neutral-300 hover:text-neutral-950 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 dark:hover:text-white';

export function DevResetButton({ collapsed }: { collapsed: boolean }) {
  const { resetAll: resetResolutions } = useActivityResolutions();
  const { sessions, deleteSession } = useChatHistory();
  const { scenarioId, setScenario } = useScenario();

  const resetApprovals = () => {
    resetResolutions();
    toast.success('Approvals reset');
  };

  const resetAll = () => {
    resetResolutions();
    for (const s of sessions) deleteSession(s.id);
    try { sessionStorage.removeItem('pending-chat-message'); } catch { /* */ }
    toast.success('App reset');
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-neutral-200/60 px-1 py-2 dark:border-neutral-800">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { if (s.id !== scenarioId) setScenario(s.id); }}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-[10px] font-bold transition-colors',
              s.id === scenarioId
                ? 'bg-neutral-200 text-neutral-950 dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-400 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-neutral-800',
            )}
            title={s.name}
          >
            {s.id === 'busy' ? 'B' : s.id === 'handled' ? 'H' : 'J'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200/60 px-2.5 py-2.5 dark:border-neutral-800">
      <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
        Business Stages
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { if (s.id !== scenarioId) setScenario(s.id); }}
            className={`${btnClass} ${s.id === scenarioId ? activeBtnClass : ''}`}
            title={s.description}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <button type="button" onClick={resetApprovals} className={btnClass}>
          Reset approvals
        </button>
        <button type="button" onClick={resetAll} className={btnClass}>
          Reset all
        </button>
      </div>
    </div>
  );
}
