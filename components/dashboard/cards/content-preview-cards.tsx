import type { ContentPreview } from '@/lib/activity/types';

type ContentPreviewCardsProps = {
  items: ContentPreview[];
};

export function ContentPreviewCards({ items }: ContentPreviewCardsProps) {
  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="h-[240px] w-[160px] shrink-0 overflow-hidden rounded-[10px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full" style={{ backgroundColor: item.color }} />
          )}
        </div>
      ))}
    </div>
  );
}
