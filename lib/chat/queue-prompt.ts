const UI_ACTIONS_DISCLAIMER = 'Do not include instructions like "say send or skip" in your messages — the UI provides action buttons automatically.';

export function buildQueuePrompt({
  header,
  items,
  steps,
}: {
  header: string;
  items: { label: string; detail?: string }[];
  steps: string[];
}): string {
  return [
    header,
    '',
    ...items.map((item, i) => `${i + 1}. ${item.label}${item.detail ? ` — ${item.detail}` : ''}`),
    '',
    ...steps,
    '',
    UI_ACTIONS_DISCLAIMER,
    '',
    'Start with #1.',
  ].join('\n');
}
