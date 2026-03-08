type JokeOutput =
  | { type: 'single'; joke: string; category: string }
  | { type: 'twopart'; setup: string; delivery: string; category: string };

export function JokeResult({ data }: { data: JokeOutput }) {
  return (
    <div className="bg-white px-4 py-3 dark:bg-neutral-950">
      {data.type === 'twopart' ? (
        <div className="space-y-1.5">
          <p className="text-sm text-neutral-900 dark:text-neutral-100">{data.setup}</p>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {data.delivery}
          </p>
        </div>
      ) : (
        <p className="text-sm text-neutral-900 dark:text-neutral-100">{data.joke}</p>
      )}
      <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">{data.category}</p>
    </div>
  );
}
