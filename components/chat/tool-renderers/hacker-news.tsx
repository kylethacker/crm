type Story = {
  title: string;
  url: string;
  score: number;
  author: string;
  commentCount: number;
};

type HackerNewsOutput = {
  stories: Story[];
};

export function HackerNewsResult({ data }: { data: HackerNewsOutput }) {
  if (!data.stories?.length) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">📰</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No stories found
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 bg-white dark:divide-neutral-800/60 dark:bg-neutral-950">
      {data.stories.map((story, i) => (
        <div key={story.url} className="flex items-start gap-3 px-4 py-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-orange-100 text-[10px] font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-neutral-900 hover:underline dark:text-neutral-100"
            >
              {story.title}
            </a>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
              <span>{story.score} pts</span>
              <span>by {story.author}</span>
              <span>{story.commentCount} comments</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
