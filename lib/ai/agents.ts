import { ToolLoopAgent, stepCountIs } from 'ai';
import { getModel } from './gateway';
import { tools } from './tools';

/**
 * AI SDK v6 ToolLoopAgent configurations.
 *
 * Each agent is a reusable, multi-step reasoning loop that can call tools,
 * collect results, and chain actions autonomously. Define once, use
 * everywhere — API routes, background jobs, chat UIs.
 *
 * @example
 * import { agents } from '@/lib/ai/agents';
 *
 * // Streaming (chat UIs)
 * const result = await agents.assistant.stream({ messages });
 *
 * // Non-streaming (background jobs)
 * const result = await agents.assistant.generate({ prompt: 'Research X' });
 *
 * @see https://ai-sdk.dev/docs/agents/building-agents
 */

const SYSTEM_PROMPTS = {
  assistant: `\
You are a helpful, accurate, and concise AI assistant.
- Respond thoughtfully and never fabricate facts.
- When using tools, briefly explain what you're doing.
- Tool results are displayed to the user in rich UI cards automatically. After using tools, give a brief natural-language response — don't repeat the data the tools already returned.
- You can use multiple tools in sequence to answer complex questions that require multiple steps.
- If you're unsure, say so — don't guess.`,

  researcher: `\
You are a thorough research assistant that digs deep to find comprehensive answers.
- Break complex questions into sub-tasks and tackle them step by step.
- Use multiple tools in sequence — search Wikipedia, look up definitions, check facts, cross-reference sources.
- Synthesize information from multiple tool calls into a clear, well-structured response.
- When one tool result raises new questions, follow up with additional tool calls.
- Cite your sources and explain your reasoning.
- Tool results are displayed to the user in rich UI cards automatically — don't repeat raw data, synthesize it.`,

  coder: `\
You are an expert software engineer.
- Provide clean, idiomatic, production-ready code.
- Always consider edge cases, performance, and security.
- Use the calculate tool to verify numeric computations when relevant.
- Use Wikipedia or other tools to look up APIs, standards, or specs when needed.
- Explain your reasoning when it's non-obvious.`,
} as const;

function createAgent(
  name: keyof typeof SYSTEM_PROMPTS,
  maxSteps: number,
) {
  return new ToolLoopAgent({
    model: getModel('claude-sonnet'),
    instructions: SYSTEM_PROMPTS[name],
    tools,
    stopWhen: stepCountIs(maxSteps),
  });
}

export const agents = {
  assistant: createAgent('assistant', 5),
  researcher: createAgent('researcher', 10),
  coder: createAgent('coder', 3),
};

export type AgentName = keyof typeof agents;

export const AGENT_NAMES = Object.keys(agents) as [AgentName, ...AgentName[]];

export const AGENT_DISPLAY: Record<AgentName, { label: string }> = {
  assistant: { label: 'Assistant' },
  researcher: { label: 'Researcher' },
  coder: { label: 'Coder' },
};
