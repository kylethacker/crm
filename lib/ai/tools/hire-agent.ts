import { tool } from 'ai';
import { z } from 'zod';
import { agentDefinitions } from '@/lib/marketplace/data';

export const hireAgentTool = tool({
  description:
    'Hire a marketplace agent and add it to the team. Use this immediately when the user asks to add, hire, or set up an agent. Do not describe the agent first — just hire it.',
  strict: true,
  inputSchema: z.object({
    agentId: z
      .string()
      .describe(
        'The agent ID to hire (e.g. "blog-writer", "speed-to-lead", "deal-closer")',
      ),
  }),
  execute: async ({ agentId }) => {
    const def = agentDefinitions.find((a) => a.id === agentId);

    if (!def) {
      return {
        success: false as const,
        error: `No agent found with id "${agentId}". Available agents: ${agentDefinitions.map((a) => a.id).join(', ')}`,
      };
    }

    const settingsWithDefaults = (def.settings ?? []).map((s) => ({
      key: s.key,
      label: s.label,
      value: s.default,
    }));

    return {
      success: true as const,
      agentId: def.id,
      name: def.name,
      role: def.role,
      price: def.price,
      defaultAutonomy: def.defaultAutonomy,
      expectedOutcome: def.expectedOutcome ?? null,
      highlights: def.highlights ?? [],
      triggers: def.triggers,
      settings: settingsWithDefaults,
    };
  },
});
