import { AspectRatio, FilterType, MediaClip, TextOverlay, TransitionType } from '../types';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export function getCanvasDimensions(aspectRatio: AspectRatio): CanvasDimensions {
  switch (aspectRatio) {
    case '9:16':
      return { width: 720, height: 1280 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '16:9':
      return { width: 1280, height: 720 };
  }
}

// Global media asset loader & cache
export class MediaCache {
  private images = new Map<string, HTMLImageElement>();
  private videos = new Map<string, HTMLVideoElement>();
  private loadingPromises = new Map<string, Promise<any>>();

  public async getImage(src: string): Promise<HTMLImageElement | null> {
    if (this.images.has(src)) return this.images.get(src)!;
    if (this.loadingPromises.has(src)) return this.loadingPromises.get(src);

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.images.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        // Fallback for broken/CORS-blocked external images: create colored fallback canvas
        const fallback = document.createElement('canvas');
        fallback.width = 720;
        fallback.height = 1280;
        const ctx = fallback.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, 0, 720, 1280);
          ctx.fillStyle = '#ec4899';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Image', 360, 640);
        }
        const fallbackImg = new Image();
        fallbackImg.src = fallback.toDataURL();
        fallbackImg.onload = () => {
          this.images.set(src, fallbackImg);
          resolve(fallbackImg);
        };
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  public getVideo(src: string): HTMLVideoElement {
    if (this.videos.has(src)) return this.videos.get(src)!;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    this.videos.set(src, video);
    return video;
  }

  public getCachedImage(src: string): HTMLImageElement | null {
    return this.images.get(src) || null;
  }
}

export const mediaCache = new MediaCache();

// Apply CSS-like visual filters directly to the Canvas 2D Context
export function applyFilter(ctx: CanvasRenderingContext2D, filter: FilterType) {
  switch (filter) {
    case 'vibrant':
      ctx.filter = 'saturate(1.4) contrast(1.15) brightness(1.05)';
      break;
    case 'vintage':
      ctx.filter = 'sepia(0.4) contrast(0.95) brightness(0.95) saturate(1.1)';
      break;
    case 'noir':
      ctx.filter = 'grayscale(1) contrast(1.3) brightness(0.9)';
      break;
    case 'warm':
      ctx.filter = 'sepia(0.2) saturate(1.25) hue-rotate(-10deg) brightness(1.05)';
      break;
    case 'cyberpunk':
      ctx.filter = 'hue-rotate(290deg) contrast(1.3) saturate(1.6) brightness(1.1)';
      break;
    case 'dramatic':
      ctx.filter = 'contrast(1.4) saturate(0.85) brightness(0.95)';
      break;
    case 'normal':
    default:
      ctx.filter = 'none';
      break;
  }
}

// Draw image/video fitted to the canvas (contain vs cover)
export function drawMediaFitted(
  ctx: CanvasRenderingContext2D,
  media: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
  fit: 'cover' | 'contain' = 'cover'
) {
  if (sourceWidth <= 0 || sourceHeight <= 0) return;

  const hRatio = destWidth / sourceWidth;
  const vRatio = destHeight / sourceHeight;
  const ratio = fit === 'cover' ? Math.max(hRatio, vRatio) : Math.min(hRatio, vRatio);

  const drawWidth = sourceWidth * ratio;
  const drawHeight = sourceHeight * ratio;
  const drawX = (destWidth - drawWidth) / 2;
  const drawY = (destHeight - drawHeight) / 2;

  if (fit === 'contain') {
    // Fill background with dark blurred/solid backdrop
    ctx.fillStyle = '#05070D';
    ctx.fillRect(0, 0, destWidth, destHeight);
  }

  ctx.drawImage(media, drawX, drawY, drawWidth, drawHeight);
}

// Calculate which clip is active at a given timestamp
export function getClipAtTime(clips: MediaClip[], currentTime: number) {
  let accumulatedTime = 0;

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const clipStart = accumulatedTime;
    const clipEnd = clipStart + clip.duration;

    if (currentTime >= clipStart && (currentTime < clipEnd || i === clips.length - 1)) {
      const localTime = Math.max(0, currentTime - clipStart);
      const isNearEnd = i < clips.length - 1 && currentTime >= clipEnd - 0.5;
      const nextClip = i < clips.length - 1 ? clips[i + 1] : null;
      const transitionProgress = isNearEnd ? (currentTime - (clipEnd - 0.5)) / 0.5 : 0;

      return {
        clip,
        index: i,
        clipStart,
        clipEnd,
        localTime,
        isNearEnd,
        nextClip,
        transitionProgress: Math.min(1, Math.max(0, transitionProgress)),
      };
    }
    accumulatedTime = clipEnd;
  }

  return null;
}

// Total duration of all clips combined
export function getTotalDuration(clips: MediaClip[]): number {
  return clips.reduce((sum, c) => sum + c.duration, 0);
}

// Render a single frame to the canvas
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  clips: MediaClip[],
  textOverlays: TextOverlay[],
  currentTime: number,
  dimensions: CanvasDimensions
) {
  const { width, height } = dimensions;

  // Clear canvas
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0A0D14';
  ctx.fillRect(0, 0, width, height);

  if (clips.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No clips added to timeline', width / 2, height / 2);
    ctx.restore();
    return;
  }

  const active = getClipAtTime(clips, currentTime);
  if (!active) {
    ctx.restore();
    return;
  }

  const { clip, localTime, isNearEnd, nextClip, transitionProgress } = active;

  // Helper to draw a specific clip
  const drawClipToCtx = (targetCtx: CanvasRenderingContext2D, targetClip: MediaClip, timeInClip: number) => {
    targetCtx.save();
    applyFilter(targetCtx, targetClip.filter);

    if (targetClip.type === 'photo') {
      const img = mediaCache.getCachedImage(targetClip.src);
      if (img && img.complete) {
        drawMediaFitted(targetCtx, img, img.naturalWidth || 720, img.naturalHeight || 1280, width, height, targetClip.fit);
      } else {
        // Trigger load
        mediaCache.getImage(targetClip.src);
      }
    } else {
      const video = mediaCache.getVideo(targetClip.src);
      if (video) {
        const speed = targetClip.speed || 1;
        const targetVideoTime = (timeInClip * speed) % (video.duration || targetClip.duration);
        if (Math.abs(video.currentTime - targetVideoTime) > 0.15) {
          video.currentTime = targetVideoTime;
        }
        drawMediaFitted(targetCtx, video, video.videoWidth || 720, video.videoHeight || 1280, width, height, targetClip.fit);
      }
    }
    targetCtx.restore();
  };

  // Check for transition
  const transitionType: TransitionType = clip.transition || 'none';

  if (isNearEnd && nextClip && transitionType !== 'none') {
    // Create an offscreen buffer for the outgoing clip
    const off1 = document.createElement('canvas');
    off1.width = width;
    off1.height = height;
    const ctx1 = off1.getContext('2d')!;
    drawClipToCtx(ctx1, clip, localTime);

    // Create an offscreen buffer for the incoming next clip
    const off2 = document.createElement('canvas');
    off2.width = width;
    off2.height = height;
    const ctx2 = off2.getContext('2d')!;
    drawClipToCtx(ctx2, nextClip, 0);

    const p = transitionProgress;

    switch (transitionType) {
      case 'crossfade':
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(off1, 0, 0);
        ctx.globalAlpha = p;
        ctx.drawImage(off2, 0, 0);
        ctx.globalAlpha = 1;
        break;

      case 'fade-black':
        if (p < 0.5) {
          ctx.globalAlpha = 1 - p * 2;
          ctx.drawImage(off1, 0, 0);
        } else {
          ctx.globalAlpha = (p - 0.5) * 2;
          ctx.drawImage(off2, 0, 0);
        }
        ctx.globalAlpha = 1;
        break;

      case 'slide-left':
        ctx.drawImage(off1, -p * width, 0);
        ctx.drawImage(off2, width * (1 - p), 0);
        break;

      case 'zoom-in': {
        const scale1 = 1 + p * 0.5;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale1, scale1);
        ctx.translate(-width / 2, -height / 2);
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(off1, 0, 0);
        ctx.restore();

        const scale2 = 0.7 + p * 0.3;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale2, scale2);
        ctx.translate(-width / 2, -height / 2);
        ctx.globalAlpha = p;
        ctx.drawImage(off2, 0, 0);
        ctx.restore();
        break;
      }

      case 'flash': {
        ctx.drawImage(off1, 0, 0);
        if (p < 0.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p * 2})`;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.drawImage(off2, 0, 0);
          ctx.fillStyle = `rgba(255, 255, 255, ${(1 - p) * 2})`;
          ctx.fillRect(0, 0, width, height);
        }
        break;
      }

      default:
        drawClipToCtx(ctx, clip, localTime);
        break;
    }
  } else {
    // Normal single clip rendering
    drawClipToCtx(ctx, clip, localTime);
  }

  // Draw Text Overlays
  for (const textItem of textOverlays) {
    if (currentTime >= textItem.startTime && currentTime <= textItem.startTime + textItem.duration) {
      renderTextOverlay(ctx, textItem, currentTime, width, height);
    }
  }

  ctx.restore();
}

// Render dynamic text overlay with styling & animations
function renderTextOverlay(
  ctx: CanvasRenderingContext2D,
  item: TextOverlay,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const timeSinceStart = currentTime - item.startTime;
  const timeToEnd = item.startTime + item.duration - currentTime;

  ctx.save();

  // Animation transforms
  let alpha = 1;
  let scale = 1;
  let offsetY = 0;
  let displayText = item.text;

  if (item.animation === 'fade') {
    if (timeSinceStart < 0.3) {
      alpha = timeSinceStart / 0.3;
    } else if (timeToEnd < 0.3) {
      alpha = timeToEnd / 0.3;
    }
  } else if (item.animation === 'pop') {
    if (timeSinceStart < 0.25) {
      const p = timeSinceStart / 0.25;
      scale = 0.3 + 0.7 * Math.sin((p * Math.PI) / 2);
    }
  } else if (item.animation === 'slide-up') {
    if (timeSinceStart < 0.35) {
      const p = timeSinceStart / 0.35;
      offsetY = (1 - p) * 50;
      alpha = p;
    }
  } else if (item.animation === 'typewriter') {
    const totalChars = item.text.length;
    const progress = Math.min(1, timeSinceStart / 1.0);
    const charsToShow = Math.floor(totalChars * progress);
    displayText = item.text.slice(0, charsToShow);
  }

  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const targetX = (item.x / 100) * canvasWidth;
  const targetY = (item.y / 100) * canvasHeight + offsetY;

  // Scale based on canvas resolution (base is 720 width)
  const scaleFactor = canvasWidth / 720;
  const fontSize = Math.round(item.fontSize * scaleFactor);

  const fontStyle = `${item.italic ? 'italic ' : ''}${item.bold ? 'bold ' : ''}${fontSize}px "${item.fontFamily}", sans-serif`;
  ctx.font = fontStyle;
  ctx.textAlign = item.align;
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(displayText);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.25;

  ctx.translate(targetX, targetY);
  ctx.scale(scale, scale);

  // Background box / pill if specified
  if (item.backgroundColor && item.backgroundColor !== 'transparent') {
    const padX = 22 * scaleFactor;
    const padY = 12 * scaleFactor;
    let boxX = -padX;

    if (item.align === 'center') {
      boxX = -textWidth / 2 - padX;
    } else if (item.align === 'right') {
      boxX = -textWidth - padX;
    }

    const boxY = -textHeight / 2 - padY;
    const boxWidth = textWidth + padX * 2;
    const boxHeight = textHeight + padY * 2;
    const radius = 12 * scaleFactor;

    ctx.fillStyle = item.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
    ctx.fill();
  }

  // Text shadow for legibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Fill text
  ctx.fillStyle = item.color;
  ctx.fillText(displayText, 0, 0);

  ctx.restore();
}
