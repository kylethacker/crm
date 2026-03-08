type UnitConverterOutput = {
  value: number;
  from: string;
  to: string;
  result: number | null;
  error?: string;
};

export function UnitConverterResult({ data }: { data: UnitConverterOutput }) {
  if (data.result === null) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">📏</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {data.error ?? `Cannot convert from ${data.from} to ${data.to}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-lg dark:bg-violet-950/40">
        📏
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {data.value.toLocaleString()} {data.from}
        </span>
        <span className="text-sm text-neutral-400">=</span>
        <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {data.result.toLocaleString()} {data.to}
        </span>
      </div>
    </div>
  );
}
