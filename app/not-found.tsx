import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Page not found
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm text-neutral-600 underline hover:no-underline dark:text-neutral-400"
      >
        Go home
      </Link>
    </div>
  );
}
