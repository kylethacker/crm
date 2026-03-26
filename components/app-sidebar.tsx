'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { XIcon } from '@/components/icons';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { useViews } from '@/lib/views/context';
import { agentDefinitions } from '@/lib/marketplace/data';

const SIDEBAR_AGENT_PREVIEW_COUNT = 4;

/** Shown in the sidebar header; initials are derived automatically. */
const SIDEBAR_ACCOUNT_NAME = 'Kyle Thacker';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '?';
}

const moreAgentsIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const agentRowIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const chatBubbleIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const chevronsLeftIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </svg>
);

const chevronsRightIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </svg>
);

const helpCircleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const viewTypeIcons: Record<string, React.ReactNode> = {
  contacts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  invoices: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  quotes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
};

const primaryNavItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    href: '/messages',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    label: 'Discoverability',
    href: '/discoverability',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: 'Studio',
    href: '/studio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
];

type SidebarLinkClass = { active: boolean; collapsed: boolean };

function sidebarItemClass({ active, collapsed }: SidebarLinkClass) {
  return cn(
    'flex items-center gap-2.5 rounded-md px-2 py-1 text-sm transition-colors',
    collapsed ? 'justify-center px-0' : '',
    active
      ? 'bg-neutral-200/80 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
      : 'text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:bg-neutral-800/60',
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  return (
    <p
      className={cn(
        'mb-1 px-2 text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-500',
        collapsed && 'sr-only',
      )}
    >
      {children}
    </p>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { sessions, activeSessionId, createSession, selectSession, deleteSession } = useChatHistory();
  const { views, removeView } = useViews();

  const sidebarAgents = agentDefinitions.slice(0, SIDEBAR_AGENT_PREVIEW_COUNT);
  const accountInitials = getInitials(SIDEBAR_ACCOUNT_NAME);

  const handleNewChat = () => {
    createSession();
    router.push('/chat');
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    if (pathname !== '/chat') router.push('/chat');
  };

  return (
    <aside
      className={cn(
        'flex h-dvh shrink-0 flex-col overflow-x-hidden border-r border-neutral-200/70 bg-app-sidebar transition-[width] duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950',
        collapsed ? 'w-[52px]' : 'w-64',
      )}
    >
      {/* Account + collapse */}
      <div className={cn('flex shrink-0 items-center gap-2 px-2.5 pb-2 pt-3', collapsed && 'flex-col gap-1.5 px-1')}>
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2.5',
            collapsed && 'flex-none flex-col',
          )}
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
            aria-hidden
          >
            {accountInitials}
          </div>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {SIDEBAR_ACCOUNT_NAME}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/80 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
            collapsed && 'order-first',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? chevronsRightIcon : chevronsLeftIcon}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-0.5">
        {/* Primary */}
        <nav className="flex flex-col gap-0.5">
          {primaryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={sidebarItemClass({ active: isActive, collapsed })}
              >
                <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Agents */}
        <div className="mt-5">
          <SectionLabel collapsed={collapsed}>Agents</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {sidebarAgents.map((def) => {
              const href = `/team/${def.id}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={def.id}
                  href={href}
                  title={collapsed ? def.name : undefined}
                  className={sidebarItemClass({ active: isActive, collapsed })}
                >
                  <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{agentRowIcon}</span>
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{def.name}</span>}
                </Link>
              );
            })}
            <Link
              href="/team"
              title={collapsed ? 'More' : undefined}
              className={sidebarItemClass({ active: pathname === '/team', collapsed })}
            >
              <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{moreAgentsIcon}</span>
              {!collapsed && 'More'}
            </Link>
          </div>
        </div>

        {/* Views */}
        {views.length > 0 && (
          <div className="mt-5">
            <SectionLabel collapsed={collapsed}>Views</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {views.map((view) => {
                const isActive = pathname === `/views/${view.id}`;
                return (
                  <Link
                    key={view.id}
                    href={`/views/${view.id}`}
                    title={collapsed ? view.name : undefined}
                    className={cn(sidebarItemClass({ active: isActive, collapsed }), !collapsed && 'group')}
                  >
                    <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{viewTypeIcons[view.type]}</span>
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">{view.name}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeView(view.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              removeView(view.id);
                            }
                          }}
                          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-neutral-300/60 group-hover:opacity-100 dark:hover:bg-neutral-600"
                          aria-label={`Remove ${view.name} view`}
                        >
                          <XIcon width={12} height={12} />
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Chats */}
        <div className="mt-5">
          <SectionLabel collapsed={collapsed}>Chats</SectionLabel>
          <button
            type="button"
            onClick={handleNewChat}
            title={collapsed ? 'New chat' : undefined}
            className={cn(
              'mb-1 flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-200/55 dark:text-neutral-400 dark:hover:bg-neutral-800/80',
              collapsed && 'justify-center px-0',
            )}
          >
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-400 text-neutral-500 dark:border-neutral-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            {!collapsed && 'New chat'}
          </button>

          {sessions.length === 0 && !collapsed ? (
            <p className="px-2 py-1 text-xs text-neutral-400">No conversations yet</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId && pathname === '/chat';
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    title={collapsed ? session.title : undefined}
                    className={cn(
                      'group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left transition-colors',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-neutral-200/95 dark:bg-neutral-700/90'
                        : 'hover:bg-neutral-200/55 dark:hover:bg-neutral-800/80',
                    )}
                  >
                    <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{chatBubbleIcon}</span>
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {session.title}
                        </span>
                        {isActive && (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                            aria-hidden
                          />
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }
                          }}
                          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-neutral-300/60 group-hover:opacity-100 dark:hover:bg-neutral-600"
                          aria-label={`Delete ${session.title}`}
                        >
                          <XIcon width={12} height={12} />
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-200/60 px-2 py-2.5 dark:border-neutral-800">
        <Link
          href="/dashboard"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/80 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Help"
          title="Help"
        >
          {helpCircleIcon}
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
