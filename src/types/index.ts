export type MediaType = 'video' | 'photo';

export type AspectRatio = '9:16' | '1:1' | '16:9';

export type TransitionType = 'none' | 'crossfade' | 'fade-black' | 'slide-left' | 'zoom-in' | 'flash';

export type FilterType = 'normal' | 'vibrant' | 'vintage' | 'noir' | 'warm' | 'cyberpunk' | 'dramatic';

export type TextAnimation = 'none' | 'pop' | 'fade' | 'slide-up' | 'typewriter';

export type MotionEffect = 'none' | 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left';

export type OverlayEffect = 'none' | 'grain' | 'vhs' | 'viewfinder' | 'light-leak';

export interface MediaClip {
  id: string;
  type: MediaType;
  title: string;
  src: string;
  thumbnail: string;
  duration: number; // in seconds
  transition: TransitionType;
  filter: FilterType;
  fit: 'cover' | 'contain';
  motion?: MotionEffect; // Ken Burns dynamic photo motion
  volume?: number; // 0 to 1 for video clips (or 0-100)
  muted?: boolean;
  speed?: number; // 0.5, 1, 1.5, 2
  rotation?: number; // 0, 90, 180, 270
  trimStart?: number; // in seconds
  trimEnd?: number; // in seconds
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px relative to 1080x1920 or base
  fontFamily: string;
  color: string;
  backgroundColor: string;
  animation: TextAnimation;
  align: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px
  rotation: number; // degrees
  startTime?: number;
  duration?: number;
}

export type ExportResolution = '480p' | '720p' | '1080p';

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  duration: number;
  volume: number; // 0 to 1
  genre?: string;
  artist?: string;
  bpm?: number; // Beats Per Minute for auto-sync
}

export interface ReelProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  clips: MediaClip[];
  textOverlays: TextOverlay[];
  stickerOverlays?: StickerOverlay[];
  backgroundColor?: string;
  backgroundGradient?: string[];
  audioTrack: AudioTrack | null;
  globalOverlay?: OverlayEffect;
  fps: number;
}

