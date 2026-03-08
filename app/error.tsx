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
      <div className="max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">Something went wrong</p>
        {error.message && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error.message}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 cursor-pointer text-xs text-red-600 underline hover:no-underline dark:text-red-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
