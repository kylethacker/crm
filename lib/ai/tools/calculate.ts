import { tool } from 'ai';
import { z } from 'zod';

const MATH_ENV: Record<string, unknown> = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  pow: Math.pow,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  min: Math.min,
  max: Math.max,
  PI: Math.PI,
  E: Math.E,
};

function safeEval(expression: string): number {
  const expr = expression.replace(/\^/g, '**');

  const envKeys = Object.keys(MATH_ENV);
  const envValues = Object.values(MATH_ENV);

  const fn = new Function(...envKeys, `"use strict"; return (${expr});`);
  const result = fn(...envValues);

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Expression did not evaluate to a finite number');
  }

  return result;
}

export const calculateTool = tool({
  description:
    'Evaluate a mathematical expression. Supports basic arithmetic, exponents (^), and functions like sqrt, sin, cos, log, abs, min, max, etc.',
  strict: true,
  inputSchema: z.object({
    expression: z
      .string()
      .describe('The math expression to evaluate, e.g. "sqrt(144) + 2^3" or "sin(PI/4)"'),
  }),
  execute: async ({ expression }) => {
    try {
      const result = safeEval(expression);
      return { expression, result };
    } catch {
      return { expression, result: null, error: 'Could not evaluate expression' };
    }
  },
});
