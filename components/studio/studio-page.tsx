'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CanvasElement, Design, DesignFormat } from '@/lib/studio/types';
import { getPreset } from '@/lib/studio/templates';
import type { FormatPreset } from '@/lib/studio/templates';
import { useDesignsStore } from '@/lib/studio/store';
import { DesignCanvas } from './design-canvas';
import { FormatPicker } from './format-picker';
import { StudioChat } from './studio-chat';

type Mode = 'gallery' | 'chat' | 'editor';

function createBlankDesign(preset: FormatPreset): Design {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled',
    format: preset.format,
    width: preset.width,
    height: preset.height,
    background: '#ffffff',
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const backIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export function StudioPage() {
  const { designs, save, remove } = useDesignsStore();
  const [mode, setMode] = useState<Mode>('gallery');
  const [design, setDesign] = useState<Design | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [returnTo, setReturnTo] = useState<'gallery' | 'chat'>('gallery');

  // Listen for "Open in editor" clicks from the tool renderer
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        id: string;
        name: string;
        background: string;
        elements: CanvasElement[];
      };
      if (!design) return;
      const updated: Design = {
        ...design,
        name: detail.name,
        background: detail.background,
        elements: detail.elements,
        updatedAt: new Date().toISOString(),
      };
      setDesign(updated);
      save(updated);
      setSelectedId(null);
      setReturnTo('chat');
      setMode('editor');
    };
    document.addEventListener('studio:open-editor', handler);
    return () => document.removeEventListener('studio:open-editor', handler);
  }, [design, save]);

  const startChat = useCallback(
    (format: DesignFormat) => {
      const preset = getPreset(format);
      const d = createBlankDesign(preset);
      setDesign(d);
      setSelectedId(null);
      setChatId(crypto.randomUUID());
      setReturnTo('gallery');
      setMode('chat');
    },
    [],
  );

  const openEditorDirect = useCallback((d: Design) => {
    setDesign(d);
    setSelectedId(null);
    setReturnTo('gallery');
    setMode('editor');
  }, []);

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      setDesign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === id ? { ...el, ...patch, style: { ...el.style, ...patch.style } } : el,
          ),
        };
      });
    },
    [],
  );

  const goBackFromChat = useCallback(() => {
    if (design && design.elements.length > 0) save(design);
    setMode('gallery');
    setDesign(null);
  }, [design, save]);

  const goBackFromEditor = useCallback(() => {
    if (design) save(design);
    if (returnTo === 'chat') {
      setMode('chat');
    } else {
      setMode('gallery');
      setDesign(null);
    }
    setSelectedId(null);
  }, [design, save, returnTo]);

  const handleSave = useCallback(() => {
    if (design) save(design);
  }, [design, save]);

  // ── Gallery mode ──
  if (mode === 'gallery') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[960px] px-5 pt-8 pb-64">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Studio
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Create posters, social posts, and more with AI.
            </p>
          </div>

          <div className="mb-10">
            <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Start a new design
            </p>
            <FormatPicker selected={null} onSelect={(p) => startChat(p.format)} />
          </div>

          {designs.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Your designs
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {designs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => openEditorDirect(d)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  >
                    <div
                      className="aspect-4/3 w-full"
                      style={{ background: d.background }}
                    >
                      <div className="flex size-full items-center justify-center p-3">
                        <span className="text-xs font-medium text-neutral-400">
                          {d.elements.length} elements
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {d.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          {getPreset(d.format).label}
                        </p>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(d.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            remove(d.id);
                          }
                        }}
                        className="shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:bg-neutral-100 hover:text-neutral-600 group-hover:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                        aria-label={`Delete ${d.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Chat mode ──
  if (mode === 'chat' && design) {
    return (
      <StudioChat
        chatId={chatId}
        format={design.format}
        width={design.width}
        height={design.height}
        currentDesign={design}
        onBack={goBackFromChat}
      />
    );
  }

  // ── Editor mode ──
  if (mode === 'editor' && design) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200/70 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
          <button
            type="button"
            onClick={goBackFromEditor}
            className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            title={returnTo === 'chat' ? 'Back to chat' : 'Back to gallery'}
          >
            {backIcon}
          </button>
          <input
            type="text"
            value={design.name}
            onChange={(e) => setDesign((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
            placeholder="Design name"
          />
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {getPreset(design.format).label}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
          >
            Save
          </button>
        </div>

        <DesignCanvas
          design={design}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={updateElement}
        />
      </div>
    );
  }

  return null;
}
