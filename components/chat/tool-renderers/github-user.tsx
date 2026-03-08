import Image from 'next/image';

type GitHubUserOutput = {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  profileUrl: string;
  createdAt: string;
  error?: string;
};

export function GitHubUserResult({ data }: { data: GitHubUserOutput }) {
  if (data.error) {
    return (
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-neutral-950">
        <span className="text-lg">🐙</span>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          User &ldquo;{data.username}&rdquo; not found
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-neutral-950">
      <Image
        src={data.avatarUrl}
        alt={data.username}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
        >
          {data.name}
        </a>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">@{data.username}</p>
        {data.bio && (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{data.bio}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
          <span>{data.publicRepos} repos</span>
          <span>{data.followers.toLocaleString()} followers</span>
          <span>{data.following.toLocaleString()} following</span>
          {data.location && <span>{data.location}</span>}
        </div>
      </div>
    </div>
  );
}
