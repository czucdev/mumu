export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface Filter {
  id: string;
  name: string;
  emoji: string;
  effect: 'none' | 'beauty' | 'vintage' | 'warm' | 'cool';
}

export interface Frame {
  id: string;
  name: string;
  emoji: string;
  type: 'none' | 'heart' | 'flower' | 'star' | 'rainbow';
}

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  isActive: boolean;
}

export interface PhotoStripSettings {
  photoCount: 3 | 4;
  countdownTime: 3 | 5;
  delayBetweenPhotos: 2000 | 3000;
}

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'blur';

export interface PhotoFilter {
  type: FilterType;
  intensity: number;
}

export interface PhotoFrame {
  type: 'none' | 'classic' | 'modern' | 'polaroid';
  color: string;
}

export interface PhotoStripImage {
  id: string;
  dataUrl: string;
  filter: PhotoFilter;
  frame: PhotoFrame;
  timestamp: number;
}

export interface CanvasState {
  stickers: Sticker[];
  currentFilter: Filter['effect'];
  currentFrame: Frame['type'];
  lastCapturedImage: string | null;
}
