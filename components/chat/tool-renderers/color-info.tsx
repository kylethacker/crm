type ColorInfoOutput = {
  hex: string;
  name: string | null;
  rgb: string;
  hsl: string;
  complement: string;
  isNameExact: boolean;
  error?: string;
};

export function ColorInfoResult({ data }: { data: ColorInfoOutput }) {
  if (!data.name) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🎨</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Could not find color info
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <div className="flex shrink-0 gap-1.5">
        <div
          className="size-10 rounded-lg border border-neutral-200 dark:border-neutral-700"
          style={{ backgroundColor: data.hex }}
        />
        <div
          className="size-10 rounded-lg border border-neutral-200 dark:border-neutral-700"
          style={{ backgroundColor: data.complement }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.name}
          {!data.isNameExact && (
            <span className="ml-1.5 text-[10px] font-normal text-neutral-400">(closest match)</span>
          )}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span>HEX {data.hex}</span>
          <span>RGB {data.rgb}</span>
          <span>HSL {data.hsl}</span>
        </div>
      </div>
    </div>
  );
}
