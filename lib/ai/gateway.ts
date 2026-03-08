import { gateway } from 'ai';

/**
 * Vercel AI Gateway — unified access to 100+ models.
 *
 * Automatically authenticates via the `AI_GATEWAY_API_KEY` env var.
 * Provides built-in spend monitoring, load balancing, and fallbacks
 * with zero markup on tokens vs. calling providers directly.
 *
 * Model string format: 'provider/model-name'
 *
 * @see https://vercel.com/docs/ai-gateway
 * @see https://vercel.com/docs/ai-gateway/models-and-providers
 */

// ── Model registry ────────────────────────────────────────────────────────────

export const MODEL_IDS = {
  // Anthropic
  'claude-sonnet': 'anthropic/claude-sonnet-4-6',
  'claude-haiku': 'anthropic/claude-haiku-4-5-20251001',
  'claude-opus': 'anthropic/claude-opus-4-6',
  // OpenAI
  'gpt-5': 'openai/gpt-5.2',
  'gpt-4o': 'openai/gpt-4o',
  // Google
  'gemini-flash': 'google/gemini-3-flash',
  'gemini-pro': 'google/gemini-3-pro',
} as const;

export type ModelAlias = keyof typeof MODEL_IDS;

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Returns a gateway-backed LanguageModel by alias.
 *
 * @example
 * import { getModel } from '@/lib/ai/gateway';
 *
 * const result = await generateText({
 *   model: getModel('claude-sonnet'),
 *   prompt: 'Hello',
 * });
 */
export function getModel(alias: ModelAlias = 'claude-sonnet') {
  return gateway(MODEL_IDS[alias]);
}

// ── Convenience exports ───────────────────────────────────────────────────────

/** Balanced model for most tasks. */
export const defaultModel = getModel('claude-sonnet');

/** Fastest / cheapest model for high-throughput or latency-sensitive tasks. */
export const fastModel = getModel('claude-haiku');

/** Most capable model for complex reasoning tasks. */
export const smartModel = getModel('claude-opus');
