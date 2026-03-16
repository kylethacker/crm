import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import type { WebsiteAnalyticsStats, DailyVisitors } from '@/lib/dashboard/types';

type WebsiteAnalyticsCardProps = {
  stats: WebsiteAnalyticsStats;
  insight?: string;
};

const SOURCE_COLORS: Record<string, { bar: string; dot: string }> = {
  Organic: {
    bar: 'bg-neutral-900 dark:bg-neutral-100',
    dot: 'bg-neutral-900 dark:bg-neutral-100',
  },
  Direct: {
    bar: 'bg-neutral-500 dark:bg-neutral-400',
    dot: 'bg-neutral-500 dark:bg-neutral-400',
  },
  Social: {
    bar: 'bg-neutral-400 dark:bg-neutral-500',
    dot: 'bg-neutral-400 dark:bg-neutral-500',
  },
  Referral: {
    bar: 'bg-neutral-300 dark:bg-neutral-700',
    dot: 'bg-neutral-300 dark:bg-neutral-700',
  },
};

export function WebsiteAnalyticsCard({ stats, insight }: WebsiteAnalyticsCardProps) {
  const summary = [
    `Total visitors: ${stats.totalVisitors.toLocaleString()}`,
    `Page views: ${stats.pageViews.toLocaleString()}`,
    `Bounce rate: ${stats.bounceRate}%`,
    `Avg. session duration: ${stats.avgSessionDuration}`,
    '',
    'Traffic Sources:',
    ...stats.trafficSources.map((s) => `- ${s.source}: ${s.visitors.toLocaleString()} visitors (${s.pct}%)`),
    '',
    'Top Pages:',
    ...stats.topPages.map((p) => `- ${p.path}: ${p.views.toLocaleString()} views, avg. ${p.avgTime}`),
  ].join('\n');

  return (
    <DashboardCard
      title="Website"
      subtitle={`${stats.totalVisitors.toLocaleString()} visitors`}
      chatContext={{ sourceId: 'website-analytics', cardType: 'website-analytics', title: 'Website Analytics', summary }}
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Page views" value={stats.pageViews.toLocaleString()} />
          <Metric label="Bounce rate" value={`${stats.bounceRate}%`} />
          <Metric label="Avg. session" value={stats.avgSessionDuration} />
        </div>

        <VisitorChart data={stats.dailyVisitors} />

        <div className="flex h-2 overflow-hidden rounded-full">
          {stats.trafficSources.map((s) => (
            <div
              key={s.source}
              className={cn('transition-all', SOURCE_COLORS[s.source]?.bar ?? 'bg-neutral-200 dark:bg-neutral-700')}
              style={{ width: `${s.pct}%` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {stats.trafficSources.map((s) => (
            <div key={s.source} className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className={cn('inline-block size-2 rounded-full', SOURCE_COLORS[s.source]?.dot ?? 'bg-neutral-200 dark:bg-neutral-700')} />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{s.source}</span>
              </div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {s.visitors.toLocaleString()} <span className="font-normal text-neutral-400">({s.pct}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

const CHART_W = 300;
const CHART_H = 80;
const PAD_X = 0;
const PAD_Y = 4;

function VisitorChart({ data }: { data: DailyVisitors[] }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.visitors);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = PAD_X + (i / (data.length - 1)) * (CHART_W - PAD_X * 2);
    const y = PAD_Y + (1 - (d.visitors - min) / range) * (CHART_H - PAD_Y * 2);
    return { x, y };
  });

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const lastPt = points[points.length - 1]!;
  const firstPt = points[0]!;
  const areaD = `${lineD} L${lastPt.x},${CHART_H} L${firstPt.x},${CHART_H} Z`;

  const first = data[0]!.date;
  const last = data[data.length - 1]!.date;

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-20 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="visitors-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-neutral-900)] dark:[stop-color:var(--color-neutral-200)]" stopOpacity="0.15" />
            <stop offset="100%" className="[stop-color:var(--color-neutral-900)] dark:[stop-color:var(--color-neutral-200)]" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#visitors-fill)" />
        <path
          d={lineD}
          fill="none"
          className="stroke-neutral-900 dark:stroke-neutral-200"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between px-0.5">
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{first}</span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{last}</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-neutral-400 dark:text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</span>
    </div>
  );
}
