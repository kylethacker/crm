'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AgentDefinition, AgentSettingDef, AutonomyLevel } from '@/lib/marketplace/types';
import { resolveSettings } from '@/lib/marketplace/settings';
import { buildHirePrompt } from '@/lib/marketplace/data';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { useContactsStore } from '@/lib/contacts/store';
import Link from 'next/link';
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
import { MarketplaceAgentIcon } from '@/components/marketplace/agent-icon';
import { ActionCard } from '@/components/dashboard/action-card';
import { actionsToCards } from '@/lib/dashboard/briefing';
import type { ActionQueueCard } from '@/lib/dashboard/types';

const AUTONOMY_LEVELS: AutonomyLevel[] = ['draft-approve', 'auto'];

type AgentSidebarTab = 'activity' | 'settings';

const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 420;
const DEFAULT_SIDEBAR_WIDTH = 320;

export function AgentDetail({ agentDef }: { agentDef: AgentDefinition }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboard') === '1';
  const { getAgent, approveAction, dismissAction, togglePause, setAutonomy, updateSetting } = useActiveAgents();
  const { conversations } = useContactsStore();
  const active = getAgent(agentDef.id);

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [sidebarTab, setSidebarTab] = useState<AgentSidebarTab>('activity');
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

  // ── Edit injection: from sidebar card or from home page navigation ──
  const [editCard, setEditCard] = useState<ActionQueueCard | null>(null);
  const editConsumed = useRef(false);

  // Check for ?edit=1 from home page — read card data from sessionStorage
  useEffect(() => {
    if (searchParams.get('edit') === '1' && !editConsumed.current) {
      editConsumed.current = true;
      const raw = sessionStorage.getItem('agent-edit-card');
      if (raw) {
        sessionStorage.removeItem('agent-edit-card');
        try {
          setEditCard(JSON.parse(raw) as ActionQueueCard);
        } catch { /* ignore bad data */ }
      }
    }
  }, [searchParams]);

  const handleCardEdit = useCallback((card: ActionQueueCard) => {
    setEditCard(card);
  }, []);

  const handleEditCardConsumed = useCallback(() => {
    setEditCard(null);
  }, []);

  return (
    <div className="flex h-full">
      {/* ── Main: Chat ── */}
      <div className="relative flex min-h-0 flex-1 flex-col">
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
          editCard={editCard}
          onEditCardConsumed={handleEditCardConsumed}
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
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-800 dark:shadow-none">
              <MarketplaceAgentIcon agentId={agentDef.id} size="md" />
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

          {/* Tabs */}
          <div
            className="mt-4 flex rounded-lg bg-neutral-200/50 p-0.5 dark:bg-neutral-800/50"
            role="tablist"
            aria-label="Agent sidebar"
          >
            {(['activity', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={sidebarTab === tab}
                onClick={() => setSidebarTab(tab)}
                className={cn(
                  'flex-1 cursor-pointer rounded-md py-1.5 text-center text-xs font-medium transition-colors',
                  sidebarTab === tab
                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300',
                )}
              >
                {tab === 'activity' ? 'Activity' : 'Settings'}
              </button>
            ))}
          </div>

          {/* Activity */}
          {sidebarTab === 'activity' && (
            <div className="mt-4 space-y-4" role="tabpanel">
              {!active && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Hire this agent from the team page to see outcomes, approvals, and activity here.
                </p>
              )}

              {active && Object.keys(active.outcomes).length > 0 && (
                <div className="flex flex-wrap gap-2">
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

              {pendingActions.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Needs Approval
                    </h2>
                    <span className="flex size-4 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {pendingActions.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {actionsToCards(pendingActions).map((card) => (
                      <ActionCard key={card.id} card={card} onEdit={handleCardEdit} />
                    ))}
                  </div>
                </div>
              )}

              {active && (
                <div>
                  <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Recent Activity
                  </h2>
                  {active.recentActions.length > 0 ? (
                    <div className="mt-2 flex flex-col gap-0">
                      {active.recentActions.map((action, i) => {
                        const handleViewDetails = () => {
                          if (action.contactName) {
                            const match = conversations.find((c) => c.contact.name === action.contactName);
                            if (match) {
                              router.push(`/messages?contactId=${match.contact.id}`);
                            }
                          }
                        };
                        const viewDetailsBtnClass =
                          'mt-1 shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 opacity-0 transition-all hover:bg-neutral-50 group-hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700';
                        return (
                          <div key={action.id} className="group flex gap-2.5 py-2">
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
                              <div className="flex items-start gap-2">
                                <p className="min-w-0 flex-1 text-xs text-neutral-700 dark:text-neutral-300">
                                  {action.description}
                                </p>
                                {action.contactName ? (
                                  <button type="button" onClick={handleViewDetails} className={viewDetailsBtnClass}>
                                    View details
                                  </button>
                                ) : (
                                  <Link href={`/team/${action.agentId}`} className={viewDetailsBtnClass}>
                                    View details
                                  </Link>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                                {action.contactName && <span>{action.contactName}</span>}
                                {action.contactName && <span>·</span>}
                                <span>{formatRelativeTime(action.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      No activity yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {sidebarTab === 'settings' && (
            <div className="mt-4" role="tabpanel">
              {active ? (
                <>
                  <div className="mt-0">
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

                  <div className="mt-4">
                    <label
                      htmlFor={`instructions-${agentDef.id}`}
                      className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      Custom Instructions
                    </label>
                    <textarea
                      id={`instructions-${agentDef.id}`}
                      value={(resolvedSettings['customInstructions'] as string) ?? ''}
                      onChange={(e) => updateSetting(agentDef.id, 'customInstructions', e.target.value)}
                      rows={3}
                      placeholder="Add specific instructions for this agent..."
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs leading-relaxed text-neutral-800 placeholder-neutral-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/40"
                    />
                    <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                      These instructions apply only to this agent.
                    </p>
                  </div>

                  {agentDef.settings && agentDef.settings.filter((s) => s.key !== 'tone').length > 0 && (
                    <div className="mt-4 flex flex-col gap-3">
                      {agentDef.settings.filter((s) => s.key !== 'tone').map((setting) => (
                        <SidebarSettingControl
                          key={setting.key}
                          setting={setting}
                          value={resolvedSettings[setting.key]!}
                          onChange={(val) => updateSetting(agentDef.id, setting.key, val)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => togglePause(agentDef.id)}
                      className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-white dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/30"
                    >
                      {active.paused ? 'Resume Agent' : 'Pause Agent'}
                    </button>
                  </div>

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
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Activate this agent from the team roster to change autonomy and options.
                  </p>
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
                </>
              )}
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
