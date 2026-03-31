export function GreetingLine({ greeting }: { greeting: string }) {
  return (
    <div>
      <p className="text-lg leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-xl">
        {greeting}
      </p>
    </div>
  );
}
