'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AgentDefinition, AgentSettingDef, AutonomyLevel } from '@/lib/marketplace/types';
import { resolveSettings } from '@/lib/marketplace/settings';
import { buildHirePrompt } from '@/lib/marketplace/data';
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
import { AgentChat } from './agent-chat';

const AUTONOMY_LEVELS: AutonomyLevel[] = ['suggest', 'draft-approve', 'auto'];

const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 420;
const DEFAULT_SIDEBAR_WIDTH = 320;

export function AgentDetail({ agentDef }: { agentDef: AgentDefinition }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboard') === '1';
  const { getAgent, approveAction, dismissAction, togglePause, setAutonomy, updateSetting } = useActiveAgents();
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
    // Dragging right = making sidebar wider (sidebar is on the right)
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
  const resolvedSettings = resolveSettings(agentDef, active?.settings);

  const agentContext = {
    agentId: agentDef.id,
    agentName: agentDef.name,
    agentRole: agentDef.role,
    autonomy: active?.autonomy ?? agentDef.defaultAutonomy,
    outcomes: active?.outcomes ?? {},
  };

  const onboardingMessage = isOnboarding ? buildHirePrompt(agentDef) : undefined;

  return (
    <div className="flex h-full">
      {/* ── Main: Chat ── */}
      <div className="relative flex flex-1 flex-col">
        <button
          type="button"
          onClick={() => router.push('/team')}
          className="absolute top-3 left-3 z-10 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        {/* Chat area */}
        <AgentChat
          agentContext={agentContext}
          agentSettings={resolvedSettings}
          initialMessage={onboardingMessage}
        />
      </div>

      {/* ── Resize handle ── */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group relative z-10 flex w-0 shrink-0 cursor-col-resize items-center justify-center"
      >
        <div className="absolute inset-y-0 -left-px w-[3px] bg-transparent transition-colors group-hover:bg-neutral-300 group-active:bg-neutral-400 dark:group-hover:bg-neutral-600 dark:group-active:bg-neutral-500" />
        <div className="absolute inset-y-0 -left-1.5 w-3" />
      </div>

      {/* ── Sidebar: Settings + Activity ── */}
      <div className="shrink-0 overflow-y-auto border-l border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-950/50" style={{ width: sidebarWidth }}>
        <div className="px-4 pt-4 pb-16">
          {/* Agent header */}
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-800 dark:shadow-none">
              {agentDef.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
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
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{agentDef.role}</p>
            </div>
          </div>

          {/* Outcome metrics */}
          {active && Object.keys(active.outcomes).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(active.outcomes).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatOutcomeValue(key, value)}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{key}</p>
                </div>
              ))}
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRelativeTime(active.activatedAt)}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">active since</p>
              </div>
            </div>
          )}

          {/* Pending actions */}
          {pendingActions.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Needs Approval
                </h2>
                <span className="flex size-4 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold dark:bg-amber-800">
                  {pendingActions.length}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-lg bg-white p-2.5 dark:bg-neutral-900"
                  >
                    <p className="text-xs text-neutral-900 dark:text-neutral-100">
                      {action.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => approveAction(agentDef.id, action.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
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

          {/* Settings */}
          {active && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Settings
              </h2>

              {/* Autonomy */}
              <div className="mt-3">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Autonomy</p>
                <div className="mt-1.5 flex flex-col gap-1">
                  {AUTONOMY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setAutonomy(agentDef.id, level)}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-lg border px-2.5 py-1.5 text-left transition-colors',
                        active.autonomy === level
                          ? 'border-neutral-900 bg-white dark:border-neutral-100 dark:bg-neutral-800/50'
                          : 'border-neutral-200 hover:bg-white dark:border-neutral-800 dark:hover:bg-neutral-800/30',
                      )}
                    >
                      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {autonomyLabel[level]}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {autonomyDescription[level]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent-specific settings */}
              {agentDef.settings && agentDef.settings.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {agentDef.settings.map((setting) => (
                    <SidebarSettingControl
                      key={setting.key}
                      setting={setting}
                      value={resolvedSettings[setting.key]!}
                      onChange={(val) => updateSetting(agentDef.id, setting.key, val)}
                    />
                  ))}
                </div>
              )}

              {/* Pause / Resume */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => togglePause(agentDef.id)}
                  className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-white dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/30"
                >
                  {active.paused ? 'Resume Agent' : 'Pause Agent'}
                </button>
              </div>

              {/* Price + Triggers */}
              <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                {agentDef.price === 0 ? 'Free' : `$${agentDef.price}/mo`}
              </div>
              {agentDef.triggers.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Triggers</p>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {agentDef.triggers.map((t) => (
                      <div key={t.description} className="flex items-center gap-1.5">
                        <span className="size-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{t.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity feed */}
          {active && active.recentActions.length > 0 && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Activity
              </h2>
              <div className="mt-2 flex flex-col gap-0">
                {active.recentActions.map((action, i) => (
                  <div key={action.id} className="flex gap-2.5 py-2">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        'mt-1 size-1.5 shrink-0 rounded-full',
                        action.status === 'proposed' ? 'bg-amber-400' :
                        action.status === 'approved' ? 'bg-blue-400' :
                        action.status === 'executed' ? 'bg-green-400' :
                        'bg-neutral-300 dark:bg-neutral-600',
                      )} />
                      {i < active.recentActions.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-0.5">
                      <p className="text-xs text-neutral-700 dark:text-neutral-300">
                        {action.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
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
        </div>
      </div>
    </div>
  );
}

// ── Compact setting control for sidebar ──────────────────────────────────────

function SidebarSettingControl({
  setting,
  value,
  onChange,
}: {
  setting: AgentSettingDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
        {setting.label}
      </label>
      <div className="mt-1">
        {setting.type === 'select' && (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
          >
            {setting.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {setting.type === 'number' && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={value as number}
              min={setting.min}
              max={setting.max}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num)) onChange(num);
              }}
              className="w-20 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
            />
            {setting.unit && (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{setting.unit}</span>
            )}
          </div>
        )}
        {setting.type === 'text' && (
          <input
            type="text"
            value={value as string}
            placeholder={setting.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
          />
        )}
        {setting.type === 'toggle' && (
          <button
            type="button"
            onClick={() => onChange(!(value as boolean))}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
              value ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-700',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform dark:bg-neutral-900',
                value ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        )}
      </div>
    </div>
  );
}
