type CountryInfoOutput = {
  name: string | null;
  officialName?: string;
  capital: string | null;
  population: number | null;
  region: string | null;
  subregion?: string | null;
  languages: string | null;
  currencies: string | null;
  flag: string | null;
  error?: string;
};

function formatPopulation(pop: number): string {
  if (pop >= 1e9) return `${(pop / 1e9).toFixed(2)}B`;
  if (pop >= 1e6) return `${(pop / 1e6).toFixed(1)}M`;
  if (pop >= 1e3) return `${(pop / 1e3).toFixed(0)}K`;
  return pop.toLocaleString();
}

export function CountryInfoResult({ data }: { data: CountryInfoOutput }) {
  if (!data.name) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🌍</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Country not found
        </p>
      </div>
    );
  }

  const facts = [
    data.capital && { label: 'Capital', value: data.capital },
    data.population != null && { label: 'Population', value: formatPopulation(data.population) },
    data.region && { label: 'Region', value: data.subregion ? `${data.subregion}, ${data.region}` : data.region },
    data.languages && { label: 'Languages', value: data.languages },
    data.currencies && { label: 'Currencies', value: data.currencies },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex items-center gap-2">
        {data.flag && <span className="text-2xl">{data.flag}</span>}
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {data.name}
          </p>
          {data.officialName && data.officialName !== data.name && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {data.officialName}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {fact.label}
            </dt>
            <dd className="text-xs text-neutral-900 dark:text-neutral-100">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
