'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AgentIconSize = 'sm' | 'md' | 'lg' | 'xl';

const sizePx: Record<AgentIconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

function Svg({
  size,
  className,
  children,
}: {
  size: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function iconForAgentId(agentId: string, size: number) {
  switch (agentId) {
    case 'speed-to-lead':
      return (
        <Svg size={size}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </Svg>
      );
    case 'deal-closer':
      return (
        <Svg size={size}>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </Svg>
      );
    case 'reputation-builder':
      return (
        <Svg size={size}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Svg>
      );
    case 'slot-filler':
      return (
        <Svg size={size}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );
    case 'friendly-collector':
      return (
        <Svg size={size}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </Svg>
      );
    case 'churn-preventer':
      return (
        <Svg size={size}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </Svg>
      );
    case 'week-planner':
      return (
        <Svg size={size}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6M9 18h6M9 10h2" />
        </Svg>
      );
    case 'blog-writer':
      return (
        <Svg size={size}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </Svg>
      );
    default:
      return (
        <Svg size={size}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </Svg>
      );
  }
}

type MarketplaceAgentIconProps = {
  agentId: string;
  size?: AgentIconSize;
  className?: string;
};

export function MarketplaceAgentIcon({ agentId, size = 'md', className }: MarketplaceAgentIconProps) {
  const px = sizePx[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center text-neutral-600 dark:text-neutral-400', className)}>
      {iconForAgentId(agentId, px)}
    </span>
  );
}
