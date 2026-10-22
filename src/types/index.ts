export type MediaType = 'video' | 'photo';

export type AspectRatio = '9:16' | '1:1' | '16:9';

export type TransitionType = 'none' | 'crossfade' | 'fade-black' | 'slide-left' | 'zoom-in' | 'flash';

export type FilterType = 'normal' | 'vibrant' | 'vintage' | 'noir' | 'warm' | 'cyberpunk' | 'dramatic';

export type TextAnimation = 'none' | 'pop' | 'fade' | 'slide-up' | 'typewriter';

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
  volume?: number; // 0 to 1 for video clips
  speed?: number; // 0.5, 1, 1.5, 2
  rotation?: number; // 0, 90, 180, 270
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
}

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  duration: number;
  volume: number; // 0 to 1
  genre?: string;
  artist?: string;
}

export interface ReelProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  clips: MediaClip[];
  textOverlays: TextOverlay[];
  audioTrack: AudioTrack | null;
  fps: number;
}
