'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DailyBriefing } from '@/lib/dashboard/briefing';
import type { EntityDrawerState } from '@/components/entity-drawers/types';

import { GreetingLine } from './daily-briefing';
import { ActionQueue } from './action-queue';
import { Autocompleted } from './autocompleted';
import { ActivityLog } from './activity-log';
import { EntityDrawerHost } from '@/components/entity-drawers/entity-drawer-host';

type DashboardTab = 'queue' | 'autocompleted';

type DashboardProps = {
  briefing: DailyBriefing;
};

export function DashboardGrid({ briefing }: DashboardProps) {
  const [drawerState, setDrawerState] = useState<EntityDrawerState | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('queue');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 pt-8 pb-64">
        {/* Component 1: The Greeting Line */}
        <GreetingLine greeting={briefing.greeting} />

        {/* Component 2: Tabbed section — Action Queue / Auto-completed */}
        <section>
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors',
                activeTab === 'queue'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300',
              )}
            >
              Action Queue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('autocompleted')}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors',
                activeTab === 'autocompleted'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300',
              )}
            >
              Auto-completed
            </button>
          </div>

          {activeTab === 'queue' && (
            <ActionQueue cards={briefing.actionQueue} onOpenDrawer={setDrawerState} />
          )}
          {activeTab === 'autocompleted' && (
            <Autocompleted onOpenDrawer={setDrawerState} />
          )}
        </section>

        {/* Activity Log button */}
        <ActivityLog />
      </div>

      {/* Entity drawer for viewing attached invoices/quotes */}
      <EntityDrawerHost state={drawerState} onStateChange={setDrawerState} />
    </div>
  );
}
