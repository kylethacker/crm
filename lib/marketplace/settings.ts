import type { AgentDefinition, AgentSettings, AgentSettingDef } from './types';

/**
 * Merge definition defaults with user overrides.
 * Returns a complete settings object with every key populated.
 */
export function resolveSettings(
  def: AgentDefinition,
  overrides?: AgentSettings,
): AgentSettings {
  const result: AgentSettings = {};
  for (const setting of def.settings ?? []) {
    result[setting.key] =
      overrides && setting.key in overrides
        ? overrides[setting.key]!
        : setting.default;
  }
  return result;
}

/**
 * Replace `{{key}}` placeholders in a template with setting values.
 */
export function interpolatePrompt(
  template: string,
  settings: AgentSettings,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = settings[key];
    return value != null ? String(value) : `{{${key}}}`;
  });
}

/**
 * Build the final system prompt for an agent definition,
 * resolving settings and interpolating into the template.
 */
export function buildAgentSystemPrompt(
  def: AgentDefinition,
  overrides?: AgentSettings,
): string {
  const settings = resolveSettings(def, overrides);
  return interpolatePrompt(def.systemPrompt, settings);
}
