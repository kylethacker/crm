'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-dvh items-center justify-center p-4">
      <div className="max-w-sm rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Something went wrong</p>
        {error.message && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{error.message}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 cursor-pointer text-xs text-neutral-600 underline hover:no-underline dark:text-neutral-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
