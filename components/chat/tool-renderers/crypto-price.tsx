type CryptoPriceOutput = {
  coinId: string;
  priceUsd: number | null;
  change24h: number | null;
  marketCap: number | null;
  error?: string;
};

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  });
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatUsd(value);
}

export function CryptoPriceResult({ data }: { data: CryptoPriceOutput }) {
  if (data.priceUsd === null) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🪙</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Could not find price for &ldquo;{data.coinId}&rdquo;
        </p>
      </div>
    );
  }

  const isPositive = (data.change24h ?? 0) >= 0;

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg dark:bg-amber-950/40">
        🪙
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium capitalize text-neutral-900 dark:text-neutral-100">
          {data.coinId}
        </p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {formatUsd(data.priceUsd)}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs">
          {data.change24h !== null && (
            <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {isPositive ? '+' : ''}
              {data.change24h}% (24h)
            </span>
          )}
          {data.marketCap !== null && (
            <>
              <span className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span className="text-neutral-500 dark:text-neutral-400">
                MCap {formatMarketCap(data.marketCap)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
