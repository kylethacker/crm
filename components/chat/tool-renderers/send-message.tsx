type SendMessageOutput = {
  messageId: string;
  contactName: string;
  text: string;
  status: string;
  sentAt: string;
};

export function SendMessageResult({ data }: { data: SendMessageOutput }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Message sent to {data.contactName}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{data.text}</p>
      </div>
    </div>
  );
}
