'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/slide-over';
import { mockToneOfVoice, type ToneExample } from '@/lib/agents/tone-of-voice';

// ── Progress ring (used when tone hasn't been generated yet) ─────────────────

function ProgressRing({ count, total }: { count: number; total: number }) {
  const pct = Math.min(count / total, 1);
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-neutral-200 dark:text-neutral-700" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="text-blue-500 transition-all duration-500"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {count} of {total} approvals
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {total - count} more to auto-generate your tone
        </p>
      </div>
    </div>
  );
}

// ── Example card ─────────────────────────────────────────────────────────────

function ExampleCard({
  example,
  onMessageChange,
}: {
  example: ToneExample;
  onMessageChange: (newMessage: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(example.message);
  const isLong = example.message.length > 140;
  const displayText = expanded || editing ? example.message : example.message.slice(0, 140) + (isLong ? '...' : '');

  const handleSave = () => {
    onMessageChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(example.message);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-neutral-150 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40">
      <div className="px-3 pt-2.5 pb-2">
        {/* Header */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {example.agentName}
          </span>
          {example.wasEdited && (
            <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-medium uppercase text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              Edited
            </span>
          )}
          {!example.wasEdited && (
            <span className="rounded bg-green-100 px-1.5 py-px text-[9px] font-medium uppercase text-green-600 dark:bg-green-900/40 dark:text-green-400">
              Approved as-is
            </span>
          )}
          {/* Edit button - top right */}
          {!editing && (
            <button
              type="button"
              onClick={() => { setEditing(true); setExpanded(true); setDraft(example.message); }}
              className="ml-auto flex size-5 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-200/60 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-300"
              aria-label="Edit example"
              title="Edit example"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          )}
        </div>

        {/* Context */}
        <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
          {example.context}
        </p>

        {/* Message - view or edit mode */}
        {editing ? (
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm leading-relaxed text-neutral-700 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:focus:border-blue-600 dark:focus:ring-blue-900/40"
              autoFocus
            />
            <div className="mt-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              &ldquo;{displayText}&rdquo;
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function AgentSettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = mockToneOfVoice;
  const [prompt, setPrompt] = useState(data.prompt);
  const [examples, setExamples] = useState(data.examples);
  const [showAllExamples, setShowAllExamples] = useState(false);

  const visibleExamples = showAllExamples ? examples : examples.slice(0, 3);
  const hasMoreExamples = examples.length > 3;

  const handleExampleChange = (id: string, newMessage: string) => {
    setExamples((prev) => prev.map((ex) => (ex.id === id ? { ...ex, message: newMessage } : ex)));
  };

  return (
    <DrawerRoot open={open} onOpenChange={onOpenChange}>
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <DrawerContent>
              <DrawerHeader title="Agent Settings" />

              <DrawerBody className="px-4 py-4">
                {/* Section: Tone of Voice */}
                <div>
                  {/* Section header */}
                  <div className="mb-3 flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <path d="M12 6V2H8" />
                        <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
                        <path d="M2 12h2" />
                        <path d="M9 11v2" />
                        <path d="M15 11v2" />
                        <path d="M20 12h2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Tone of Voice
                      </h3>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Applies to all agent communications
                      </p>
                    </div>
                  </div>

                  {/* How it works explanation */}
                  {data.isGenerated ? (
                    <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2.5 dark:border-blue-900/30 dark:bg-blue-950/20">
                      <div className="mb-1 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Auto-generated from your approvals
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-blue-600/80 dark:text-blue-400/80">
                        We analyzed {data.approvalCount} messages you approved or edited to learn how you communicate.
                        This tone guide is now used by all your agents. You can edit it anytime — your changes take priority.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg border border-neutral-200 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                      <ProgressRing count={data.approvalCount} total={data.threshold} />
                      <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        As you review and approve agent drafts, we learn how you like to communicate.
                        After {data.threshold} approvals, we&apos;ll automatically create a tone-of-voice
                        guide that all your agents will follow.
                      </p>
                    </div>
                  )}

                  {/* Editable tone prompt */}
                  {data.isGenerated && (
                    <div className="mb-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor="tone-prompt"
                          className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                        >
                          Tone guide
                        </label>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          Last updated {data.generatedAt ? new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'never'}
                        </span>
                      </div>
                      <textarea
                        id="tone-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={12}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-800 placeholder-neutral-400 outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/40"
                        placeholder="Describe how your agents should communicate..."
                      />
                      <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                        Edit freely — your changes will override the auto-generated tone for all agents.
                      </p>
                    </div>
                  )}

                  {/* Examples section */}
                  {data.isGenerated && data.examples.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          Based on these messages
                        </h4>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {examples.length} examples
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {visibleExamples.map((ex) => (
                          <ExampleCard key={ex.id} example={ex} onMessageChange={(msg) => handleExampleChange(ex.id, msg)} />
                        ))}
                      </div>
                      {hasMoreExamples && (
                        <button
                          type="button"
                          onClick={() => setShowAllExamples(!showAllExamples)}
                          className="mt-2 w-full py-1.5 text-center text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                          {showAllExamples
                            ? 'Show fewer examples'
                            : `Show ${examples.length - 3} more examples`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </DrawerBody>

              {data.isGenerated && (
                <DrawerFooter>
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="solid" size="sm" onClick={() => onOpenChange(false)}>
                    Save
                  </Button>
                </DrawerFooter>
              )}
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}
