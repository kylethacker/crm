'use client';

import { useState, useCallback } from 'react';
import { ActionCard } from './action-card';
import { Button } from '@/components/ui/button';
import type { ActionQueueCard } from '@/lib/dashboard/types';
import type { EntityDrawerState } from '@/components/entity-drawers/types';

type ActionQueueProps = {
  cards: ActionQueueCard[];
  onOpenDrawer?: (state: EntityDrawerState) => void;
};

export function ActionQueue({ cards: initialCards, onOpenDrawer }: ActionQueueProps) {
  const [showAll, setShowAll] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((cardId: string) => {
    setDismissedIds((prev) => new Set(prev).add(cardId));
  }, []);

  const cards = initialCards.filter((c) => !dismissedIds.has(c.id));

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 px-6 py-12 dark:border-neutral-800">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          You&apos;re all caught up.
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          No items need your attention right now.
        </p>
      </div>
    );
  }

  // Group approval cards by category for batch mode
  const approvalsByCategory = new Map<string, ActionQueueCard[]>();
  const otherCards: ActionQueueCard[] = [];

  for (const card of cards) {
    if (card.type === 'approval') {
      const existing = approvalsByCategory.get(card.category) ?? [];
      existing.push(card);
      approvalsByCategory.set(card.category, existing);
    } else {
      otherCards.push(card);
    }
  }

  // Build display list: batch groups + individual cards
  const displayItems: Array<{ type: 'card'; card: ActionQueueCard } | { type: 'batch'; category: string; cards: ActionQueueCard[] }> = [];

  for (const [category, categoryCards] of approvalsByCategory) {
    if (categoryCards.length >= 5) {
      displayItems.push({ type: 'batch', category, cards: categoryCards });
    } else {
      for (const card of categoryCards) {
        displayItems.push({ type: 'card', card });
      }
    }
  }

  for (const card of otherCards) {
    displayItems.push({ type: 'card', card });
  }

  // Sort: batches get highest urgency from their cards, individual cards by their urgency
  displayItems.sort((a, b) => {
    const urgA = a.type === 'batch' ? Math.max(...a.cards.map((c) => c.urgency)) : a.card.urgency;
    const urgB = b.type === 'batch' ? Math.max(...b.cards.map((c) => c.urgency)) : b.card.urgency;
    return urgB - urgA;
  });

  const visibleItems = showAll ? displayItems : displayItems.slice(0, 6);
  const hasMore = displayItems.length > 6;

  return (
    <div className="flex flex-col gap-3">
      {visibleItems.map((item, idx) => {
        if (item.type === 'batch') {
          return <BatchGroup key={`batch-${item.category}`} category={item.category} cards={item.cards} onOpenDrawer={onOpenDrawer} onDismiss={handleDismiss} />;
        }
        return <ActionCard key={item.card.id ?? idx} card={item.card} onOpenDrawer={onOpenDrawer} onDismiss={handleDismiss} />;
      })}

      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="py-2 text-center text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Show {displayItems.length - 6} more items
        </button>
      )}
    </div>
  );
}

function BatchGroup({ category, cards, onOpenDrawer, onDismiss }: { category: string; cards: ActionQueueCard[]; onOpenDrawer?: (state: EntityDrawerState) => void; onDismiss?: (cardId: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {cards.length} {category} items
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">need approval</span>
        </div>
        <div className="flex gap-2">
          <Button variant="solid" size="sm">
            Approve All
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Review'}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 px-3 py-3 dark:border-neutral-800">
          {cards.map((card) => (
            <ActionCard key={card.id} card={card} onOpenDrawer={onOpenDrawer} onDismiss={onDismiss} />
          ))}
        </div>
      )}
    </div>
  );
}
