'use client';

import { cn } from '@/lib/utils';
import { FORMAT_PRESETS, type FormatPreset } from '@/lib/studio/templates';
import type { DesignFormat } from '@/lib/studio/types';

type FormatPickerProps = {
  selected: DesignFormat | null;
  onSelect: (preset: FormatPreset) => void;
};

function aspectClass(format: DesignFormat) {
  switch (format) {
    case 'instagram-post':
      return 'aspect-square';
    case 'instagram-story':
      return 'aspect-[9/16]';
    case 'poster':
      return 'aspect-[2/3]';
    case 'flyer':
      return 'aspect-[3/4]';
    case 'business-card':
      return 'aspect-[7/4]';
    case 'facebook-cover':
      return 'aspect-[16/9]';
    default:
      return 'aspect-square';
  }
}

export function FormatPicker({ selected, onSelect }: FormatPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {FORMAT_PRESETS.map((preset) => {
        const isSelected = selected === preset.format;
        return (
          <button
            key={preset.format}
            type="button"
            onClick={() => onSelect(preset)}
            className={cn(
              'group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60',
            )}
          >
            <div
              className={cn(
                'w-full max-w-[48px] rounded border',
                aspectClass(preset.format),
                isSelected
                  ? 'border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900/40'
                  : 'border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800',
              )}
            />
            <div className="text-center">
              <p className={cn(
                'text-xs font-medium',
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-700 dark:text-neutral-300',
              )}>
                {preset.label}
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{preset.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
