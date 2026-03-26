import { tool } from 'ai';
import { z } from 'zod';

const elementStyleSchema = z.object({
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.number().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  borderRadius: z.number().optional(),
  objectFit: z.enum(['cover', 'contain', 'fill']).optional(),
});

const canvasElementSchema = z.object({
  id: z.string().describe('Short descriptive slug like "heading", "bg-shape-1"'),
  type: z.enum(['text', 'image', 'shape']),
  x: z.number().describe('X position in pixels'),
  y: z.number().describe('Y position in pixels'),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  content: z.string().optional().describe('Text content for text elements'),
  src: z.string().optional().describe('Image URL for image elements. Use placehold.co URLs.'),
  shape: z.enum(['rect', 'circle']).optional(),
  style: elementStyleSchema,
  zIndex: z.number().describe('Layer order (0 = back, higher = front)'),
});

const variationSchema = z.object({
  name: z.string().describe('Short name for this variation'),
  background: z.string().describe('CSS background value (color, gradient)'),
  elements: z.array(canvasElementSchema).describe('All visual elements on the canvas'),
});

export const generateDesignTool = tool({
  description: `Generate 3 distinct design variations. ALWAYS output exactly 3 variations with different visual styles.
Each variation should have the same content/message but differ in color palette, typography, layout, or overall aesthetic.
For modifications to an existing design, output 3 different takes on the requested changes.

Design rules:
- All coordinates are in pixels relative to the canvas dimensions given in context.
- Keep elements within canvas bounds.
- Use vivid modern colors and gradients for backgrounds.
- For text: set content, fontSize (proportional to canvas), fontWeight, fontFamily (Inter, Georgia, Playfair Display, or system-ui), fill for text color.
- For shapes: set shape (rect/circle), fill, borderRadius.
- For images: set src to a placehold.co URL like "https://placehold.co/WIDTHxHEIGHT/HEX/HEX?text=LABEL".
- Use zIndex to layer properly.
- Make each variation visually distinct — different color palettes, different layouts, different typographic choices.`,
  inputSchema: z.object({
    variations: z.array(variationSchema).length(3).describe('Exactly 3 distinct design variations'),
  }),
  execute: async ({ variations }) => {
    return {
      variations: variations.map((v) => ({
        id: crypto.randomUUID(),
        name: v.name,
        background: v.background,
        elements: v.elements,
        createdAt: new Date().toISOString(),
      })),
    };
  },
});
