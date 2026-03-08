type Meaning = {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
};

type DictionaryOutput = {
  word: string;
  phonetic: string | null;
  meanings: Meaning[];
  error?: string;
};

export function DictionaryResult({ data }: { data: DictionaryOutput }) {
  if (data.error || !data.meanings.length) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">📖</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No definition found for &ldquo;{data.word}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white px-4 py-3 dark:bg-neutral-950">
      <div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {data.word}
        </span>
        {data.phonetic && (
          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            {data.phonetic}
          </span>
        )}
      </div>
      {data.meanings.map((meaning) => (
        <div key={meaning.partOfSpeech}>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {meaning.partOfSpeech}
          </p>
          <ol className="mt-1 list-inside list-decimal space-y-1">
            {meaning.definitions.map((def) => (
              <li
                key={def.definition}
                className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
                {def.definition}
                {def.example && (
                  <span className="ml-1 text-neutral-500 dark:text-neutral-400">
                    — &ldquo;{def.example}&rdquo;
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
