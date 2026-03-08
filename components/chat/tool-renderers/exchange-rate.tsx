type ExchangeRateOutput = {
  amount: number;
  from: string;
  to: string;
  result: number | null;
  rate: number | null;
  date?: string;
  error?: string;
};

export function ExchangeRateResult({ data }: { data: ExchangeRateOutput }) {
  if (data.result === null) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">💱</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {data.error ?? 'Conversion failed'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg dark:bg-emerald-950/40">
        💱
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {data.amount.toLocaleString()} {data.from}
          </span>
          <span className="text-sm text-neutral-400">=</span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {data.result.toLocaleString()} {data.to}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          {data.rate !== null && (
            <span>
              1 {data.from} = {data.rate} {data.to}
            </span>
          )}
          {data.date && (
            <>
              <span className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span>{data.date}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
