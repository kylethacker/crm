// ── Agent Types ──────────────────────────────────────────────────────────────

/** How much the agent can do without asking */
export type AutonomyLevel = 'suggest' | 'draft-approve' | 'auto';

/** What wakes the agent up */
export type TriggerType = 'event' | 'schedule';

export type AgentTrigger = {
  type: TriggerType;
  /** Human-readable description: "When a new lead comes in", "Every Sunday at 6pm" */
  description: string;
};

/** How the agent operates */
export type AgentMode = 'inbound' | 'scheduled' | 'reactive' | 'on-demand';

/** Declarative setting definition — rendered as UI controls */
export type AgentSettingDef =
  | { key: string; label: string; description?: string; type: 'select'; options: { value: string; label: string }[]; default: string }
  | { key: string; label: string; description?: string; type: 'number'; min?: number; max?: number; unit?: string; default: number }
  | { key: string; label: string; description?: string; type: 'text'; placeholder?: string; default: string }
  | { key: string; label: string; description?: string; type: 'toggle'; default: boolean };

/** Sparse map of user-overridden setting values */
export type AgentSettings = Record<string, string | number | boolean>;

/** Tools that always need approval regardless of autonomy */
export type AgentGuardrail = { tool: string; reason: string };

/** A concrete thing the agent did or wants to do */
export type AgentAction = {
  id: string;
  agentId: string;
  /** What it did in plain English */
  description: string;
  /** Which CRM tool it used or wants to use */
  tool: string;
  status: 'proposed' | 'approved' | 'executed' | 'dismissed';
  createdAt: string;
  /** The contact this action relates to, if any */
  contactName?: string;
};

export type AgentDefinition = {
  id: string;
  name: string;
  role: string;
  /** The problem in the business owner's words */
  problem: string;
  /** What this agent does — plain English, no jargon */
  does: string;
  /** What wakes it up */
  triggers: AgentTrigger[];
  /** Which CRM tools it can use */
  tools: string[];
  /** Default autonomy level for new activations */
  defaultAutonomy: AutonomyLevel;
  icon: string;
  /** Monthly price in USD (0 = free) */
  price: number;
  /** What you get — plain bullet points */
  highlights?: string[];
  /** Social proof — what this agent has achieved for others */
  expectedOutcome?: string;
  /** How the agent operates */
  mode: AgentMode;
  /** Agent-specific system prompt — uses {{key}} interpolation for settings */
  systemPrompt: string;
  /** Declarative schema for owner-configurable settings */
  settings?: AgentSettingDef[];
  /** Tools that always need approval regardless of autonomy */
  guardrails?: AgentGuardrail[];
};

export type ActiveAgent = {
  agentId: string;
  autonomy: AutonomyLevel;
  activatedAt: string;
  paused: boolean;
  /** Outcome metrics — what the agent has achieved */
  outcomes: Record<string, number>;
  /** Recent actions for the activity feed */
  recentActions: AgentAction[];
  /** Sparse overrides — only changed setting keys stored */
  settings?: AgentSettings;
};
