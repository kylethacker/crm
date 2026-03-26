import type { DesignFormat } from './types';

export type FormatPreset = {
  format: DesignFormat;
  label: string;
  width: number;
  height: number;
  description: string;
};

export const FORMAT_PRESETS: FormatPreset[] = [
  { format: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080, description: '1080 x 1080' },
  { format: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920, description: '1080 x 1920' },
  { format: 'facebook-cover', label: 'Facebook Cover', width: 1640, height: 924, description: '1640 x 924' },
  { format: 'poster', label: 'Poster', width: 2400, height: 3600, description: '2400 x 3600' },
  { format: 'flyer', label: 'Flyer', width: 1275, height: 1650, description: '1275 x 1650' },
  { format: 'business-card', label: 'Business Card', width: 1050, height: 600, description: '1050 x 600' },
];

export function getPreset(format: DesignFormat): FormatPreset {
  return FORMAT_PRESETS.find((p) => p.format === format) ?? FORMAT_PRESETS[0]!;
}
