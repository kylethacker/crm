import Image from 'next/image';

type WikipediaOutput = {
  title: string;
  extract: string;
  url: string | null;
  thumbnail: string | null;
};

export function WikipediaResult({ data }: { data: WikipediaOutput }) {
  if (!data.extract || data.extract === 'No Wikipedia article found.') {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">📚</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No Wikipedia article found for &ldquo;{data.title}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      {data.thumbnail && (
        <Image
          src={data.thumbnail}
          alt={data.title}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.title}
        </p>
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {data.extract}
        </p>
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Read on Wikipedia
          </a>
        )}
      </div>
    </div>
  );
}
