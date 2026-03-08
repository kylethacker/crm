export default function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="flex gap-1.5">
        <span className="size-2 animate-pulse rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <span className="size-2 animate-pulse rounded-full bg-neutral-300 [animation-delay:150ms] dark:bg-neutral-600" />
        <span className="size-2 animate-pulse rounded-full bg-neutral-300 [animation-delay:300ms] dark:bg-neutral-600" />
      </div>
    </div>
  );
}
