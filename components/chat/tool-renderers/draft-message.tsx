type DraftMessageOutput = {
  id: string;
  contactName: string;
  contactPhone: string;
  text: string;
  context?: string;
  status: string;
  createdAt: string;
};

export function DraftMessageResult({ data }: { data: DraftMessageOutput }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="flex text-neutral-500 dark:text-neutral-400" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Draft to {data.contactName}
          </span>
        </div>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Draft
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
          {data.text}
        </p>
        {data.context && (
          <p className="mt-2 text-xs text-neutral-400 italic">{data.context}</p>
        )}
      </div>
    </div>
  );
}
