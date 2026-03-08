type WorldTimeOutput = {
  timezone: string;
  datetime: string | null;
  abbreviation: string | null;
  utcOffset: string | null;
  error?: string;
};

export function WorldTimeResult({ data }: { data: WorldTimeOutput }) {
  if (!data.datetime) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🕐</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Invalid timezone: &ldquo;{data.timezone}&rdquo;
        </p>
      </div>
    );
  }

  const date = new Date(data.datetime);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lg dark:bg-indigo-950/40">
        🕐
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.timezone}
        </p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {timeStr}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{dateStr}</span>
          <span className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span>
            {data.abbreviation} (UTC{data.utcOffset})
          </span>
        </div>
      </div>
    </div>
  );
}
