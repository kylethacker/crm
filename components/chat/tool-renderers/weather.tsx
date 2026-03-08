type WeatherOutput = {
  location: string;
  temperature: number | null;
  condition: string;
  humidity: number | null;
  unit: 'celsius' | 'fahrenheit';
};

export function WeatherResult({ data }: { data: WeatherOutput }) {
  const unitSymbol = data.unit === 'celsius' ? '°C' : '°F';

  if (data.temperature === null) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🔍</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Could not find weather for &ldquo;{data.location}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-lg dark:bg-sky-950/40">
        <WeatherIcon condition={data.condition} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.location}
        </p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {data.temperature}{unitSymbol}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{data.condition}</span>
          <span className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span>Humidity {data.humidity}%</span>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();
  if (lower.includes('cloud') || lower.includes('overcast')) return <span>☁️</span>;
  if (lower.includes('rain') || lower.includes('drizzle')) return <span>🌧️</span>;
  if (lower.includes('snow')) return <span>❄️</span>;
  if (lower.includes('thunder') || lower.includes('storm')) return <span>⛈️</span>;
  if (lower.includes('clear') || lower.includes('sunny')) return <span>☀️</span>;
  return <span>🌤️</span>;
}
