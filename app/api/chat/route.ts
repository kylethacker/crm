import { createAgentUIStreamResponse } from 'ai';
import { z } from 'zod';
import { agents, AGENT_NAMES } from '@/lib/ai/agents';

const uiMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(z.record(z.unknown())),
  })
  .passthrough();

const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1),
  agent: z.enum(AGENT_NAMES).default('assistant'),
});

export async function POST(req: Request) {
  try {
    const { messages, agent: agentName } = chatRequestSchema.parse(
      await req.json(),
    );

    return createAgentUIStreamResponse({
      agent: agents[agentName],
      uiMessages: messages,
      abortSignal: req.signal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
