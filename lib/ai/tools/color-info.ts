import { tool } from 'ai';
import { z } from 'zod';

export const colorInfoTool = tool({
  description:
    'Get detailed information about a color, including its name, hex, RGB, HSL values, and complementary color. Accepts hex codes.',
  strict: true,
  inputSchema: z.object({
    hex: z
      .string()
      .describe('Hex color code without #, e.g. "FF5733", "3498DB", "2ECC71"'),
  }),
  execute: async ({ hex }) => {
    const clean = hex.replace(/^#/, '');
    const res = await fetch(`https://www.thecolorapi.com/id?hex=${encodeURIComponent(clean)}&format=json`);

    if (!res.ok) {
      return { hex: clean, name: null, error: 'Color not found' };
    }

    const data = await res.json();

    return {
      hex: `#${data.hex.clean}`,
      name: data.name.value,
      rgb: `${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}`,
      hsl: `${data.hsl.h}°, ${data.hsl.s}%, ${data.hsl.l}%`,
      complement: `#${data.complement?.hex?.clean ?? 'N/A'}`,
      isNameExact: data.name.exact_match_name as boolean,
    };
  },
});
