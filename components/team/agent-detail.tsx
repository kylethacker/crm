'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentDefinition, AutonomyLevel } from '@/lib/marketplace/types';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import {
  autonomyLabel,
  autonomyDescription,
  autonomyColor,
  formatOutcomeValue,
} from '@/lib/marketplace/format';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AgentChatSidebar } from './agent-chat';

const AUTONOMY_LEVELS: AutonomyLevel[] = ['suggest', 'draft-approve', 'auto'];

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 320;

export function AgentDetail({ agentDef }: { agentDef: AgentDefinition }) {
  const router = useRouter();
  const { getAgent, approveAction, dismissAction, togglePause, setAutonomy } = useActiveAgents();
  const active = getAgent(agentDef.id);

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_SIDEBAR_WIDTH);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [sidebarWidth]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    // Dragging left = making sidebar wider (sidebar is on the right)
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth.current + delta));
    setSidebarWidth(newWidth);
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const pendingActions = active?.recentActions.filter((a) => a.status === 'proposed') ?? [];

  const agentContext = {
    agentId: agentDef.id,
    agentName: agentDef.name,
    agentRole: agentDef.role,
    autonomy: active?.autonomy ?? agentDef.defaultAutonomy,
    outcomes: active?.outcomes ?? {},
  };

  return (
    <div className="flex h-full">
      {/* ── Detail panel ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-4 pt-8 pb-64">
          {/* ── Back link ── */}
          <button
            type="button"
            onClick={() => router.push('/team')}
            className="mb-6 flex cursor-pointer items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Team
          </button>

          {/* ── A. Header ── */}
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-3xl dark:bg-neutral-800">
              {agentDef.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {agentDef.name}
                </h1>
                {active && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    active.paused
                      ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  )}>
                    {active.paused ? 'Paused' : 'Active'}
                  </span>
                )}
                {active && (
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', autonomyColor[active.autonomy])}>
                    {autonomyLabel[active.autonomy]}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {agentDef.role}
              </p>
            </div>
          </div>

          {/* ── B. Outcome metrics ── */}
          {active && Object.keys(active.outcomes).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {Object.entries(active.outcomes).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatOutcomeValue(key, value)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{key}</p>
                </div>
              ))}
              <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRelativeTime(active.activatedAt)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">active since</p>
              </div>
            </div>
          )}

          {/* ── C. Pending actions ── */}
          {pendingActions.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Needs Your Approval
                </h2>
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold dark:bg-amber-800">
                  {pendingActions.length}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 dark:bg-neutral-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {action.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {action.contactName && <span>{action.contactName}</span>}
                        {action.contactName && <span>·</span>}
                        <span>{formatRelativeTime(action.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => approveAction(agentDef.id, action.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAction(agentDef.id, action.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── D. Activity feed ── */}
          {active && active.recentActions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Activity
              </h2>
              <div className="mt-3 flex flex-col gap-0">
                {active.recentActions.map((action, i) => (
                  <div key={action.id} className="flex gap-3 py-2.5">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        action.status === 'proposed' ? 'bg-amber-400' :
                        action.status === 'approved' ? 'bg-blue-400' :
                        action.status === 'executed' ? 'bg-green-400' :
                        'bg-neutral-300 dark:bg-neutral-600',
                      )} />
                      {i < active.recentActions.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {action.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                        {action.contactName && <span>{action.contactName}</span>}
                        {action.contactName && <span>·</span>}
                        <span>{formatRelativeTime(action.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── E. Settings ── */}
          {active && (
            <div className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Settings
              </h2>

              {/* Autonomy selector */}
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Autonomy</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {AUTONOMY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setAutonomy(agentDef.id, level)}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-lg border px-3 py-2 text-left transition-colors',
                        active.autonomy === level
                          ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800/50'
                          : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/30',
                      )}
                    >
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {autonomyLabel[level]}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {autonomyDescription[level]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pause/Resume */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePause(agentDef.id)}
                >
                  {active.paused ? 'Resume Agent' : 'Pause Agent'}
                </Button>
              </div>

              {/* Price */}
              <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                {agentDef.price === 0 ? 'Free' : `$${agentDef.price}/mo`}
              </div>

              {/* Triggers */}
              {agentDef.triggers.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Triggers</p>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {agentDef.triggers.map((t) => (
                      <div key={t.description} className="flex items-center gap-2">
                        <span className="size-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">{t.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Resize handle ── */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group relative z-10 flex w-0 shrink-0 cursor-col-resize items-center justify-center"
      >
        {/* Visible bar — widens on hover */}
        <div className="absolute inset-y-0 -left-px w-[3px] bg-transparent transition-colors group-hover:bg-neutral-300 group-active:bg-neutral-400 dark:group-hover:bg-neutral-600 dark:group-active:bg-neutral-500" />
        {/* Wider invisible hit area */}
        <div className="absolute inset-y-0 -left-1.5 w-3" />
      </div>

      {/* ── Chat sidebar ── */}
      <div className="shrink-0" style={{ width: sidebarWidth }}>
        <AgentChatSidebar agentContext={agentContext} />
      </div>
    </div>
  );
}
