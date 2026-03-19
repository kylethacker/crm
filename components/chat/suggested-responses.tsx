import type { SuggestedResponse } from '@/lib/chat/suggested-responses';

type SuggestedResponsesProps = {
  suggestions: SuggestedResponse[];
  onSelect: (text: string) => void;
};

export function SuggestedResponses({
  suggestions,
  onSelect,
}: SuggestedResponsesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          type="button"
          onClick={() => onSelect(suggestion.text)}
          className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
