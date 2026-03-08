type TranslateOutput = {
  originalText: string;
  translatedText: string | null;
  from: string;
  to: string;
  confidence: number | null;
  error?: string;
};

const LANG_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ru: 'Russian',
  ar: 'Arabic', hi: 'Hindi', nl: 'Dutch', sv: 'Swedish', pl: 'Polish',
  tr: 'Turkish', da: 'Danish', fi: 'Finnish', no: 'Norwegian', el: 'Greek',
};

function langName(code: string) {
  return LANG_NAMES[code.toLowerCase()] ?? code.toUpperCase();
}

export function TranslateResult({ data }: { data: TranslateOutput }) {
  if (!data.translatedText) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🌐</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Translation failed — check your language codes.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 bg-white dark:divide-neutral-800/60 dark:bg-neutral-950">
      <div className="px-4 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {langName(data.from)}
        </p>
        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{data.originalText}</p>
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {langName(data.to)}
        </p>
        <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.translatedText}
        </p>
      </div>
    </div>
  );
}
