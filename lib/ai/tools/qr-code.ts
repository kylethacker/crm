import { tool } from 'ai';
import { z } from 'zod';

export const qrCodeTool = tool({
  description:
    'Generate a QR code image URL for any text or URL. Use this when the user wants a QR code.',
  strict: true,
  inputSchema: z.object({
    data: z.string().describe('The text or URL to encode in the QR code'),
    size: z
      .number()
      .int()
      .min(100)
      .max(500)
      .default(200)
      .describe('Image size in pixels (100-500)'),
  }),
  execute: async ({ data, size }) => {
    const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&format=png`;

    return { data, imageUrl, size };
  },
});
