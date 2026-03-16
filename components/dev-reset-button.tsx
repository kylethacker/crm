'use client';

import { useActivityResolutions } from '@/lib/activity/use-resolutions';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { toast } from 'sonner';

const btnClass =
  'cursor-pointer rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300';

export function DevResetButton() {
  const { resetAll: resetResolutions } = useActivityResolutions();
  const { sessions, deleteSession } = useChatHistory();

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

  return (
    <div className="fixed left-3 bottom-3 z-50 flex items-center gap-1.5">
      <button type="button" onClick={resetApprovals} className={btnClass}>
        Reset approvals
      </button>
      <button type="button" onClick={resetAll} className={btnClass}>
        Reset all
      </button>
    </div>
  );
}
