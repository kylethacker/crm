export type DesignFormat =
  | 'instagram-post'
  | 'instagram-story'
  | 'poster'
  | 'flyer'
  | 'business-card'
  | 'facebook-cover';

export type ElementStyle = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  opacity?: number;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
};

export type CanvasElement = {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  src?: string;
  shape?: 'rect' | 'circle';
  style: ElementStyle;
  zIndex: number;
};

export type Design = {
  id: string;
  name: string;
  format: DesignFormat;
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];
  createdAt: string;
  updatedAt: string;
};
