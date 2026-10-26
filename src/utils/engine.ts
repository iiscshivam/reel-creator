import { AspectRatio, FilterType, MediaClip, MotionEffect, OverlayEffect, StickerOverlay, TextOverlay, TransitionType } from '../types';

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
      ctx.filter = 'sepia(0.25) saturate(1.3) hue-rotate(-10deg) brightness(1.05)';
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

// Draw image/video fitted to the canvas with Ken Burns motion effect
export function drawMediaFitted(
  ctx: CanvasRenderingContext2D,
  media: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
  fit: 'cover' | 'contain' = 'cover',
  motion: MotionEffect = 'none',
  progress = 0 // 0 to 1 across clip duration
) {
  if (sourceWidth <= 0 || sourceHeight <= 0) return;

  ctx.save();

  const hRatio = destWidth / sourceWidth;
  const vRatio = destHeight / sourceHeight;
  const baseRatio = fit === 'cover' ? Math.max(hRatio, vRatio) : Math.min(hRatio, vRatio);

  let scale = 1.0;
  let offsetX = 0;
  let offsetY = 0;

  // Ken Burns Motion computation
  if (motion === 'zoom-in') {
    scale = 1.0 + progress * 0.15; // 1.0 to 1.15
  } else if (motion === 'zoom-out') {
    scale = 1.15 - progress * 0.15; // 1.15 to 1.0
  } else if (motion === 'pan-right') {
    scale = 1.12;
    offsetX = (progress - 0.5) * 40;
  } else if (motion === 'pan-left') {
    scale = 1.12;
    offsetX = (0.5 - progress) * 40;
  }

  const effectiveRatio = baseRatio * scale;
  const drawWidth = sourceWidth * effectiveRatio;
  const drawHeight = sourceHeight * effectiveRatio;
  const drawX = (destWidth - drawWidth) / 2 + offsetX;
  const drawY = (destHeight - drawHeight) / 2 + offsetY;

  if (fit === 'contain') {
    ctx.fillStyle = '#05070D';
    ctx.fillRect(0, 0, destWidth, destHeight);
  }

  ctx.drawImage(media, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
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
      const progress = clip.duration > 0 ? Math.min(1, localTime / clip.duration) : 0;
      const isNearEnd = i < clips.length - 1 && currentTime >= clipEnd - 0.45;
      const nextClip = i < clips.length - 1 ? clips[i + 1] : null;
      const transitionProgress = isNearEnd ? (currentTime - (clipEnd - 0.45)) / 0.45 : 0;

      return {
        clip,
        index: i,
        clipStart,
        clipEnd,
        localTime,
        progress,
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

// Render aesthetic overlays: 35mm Grain, VHS Date Stamp, Camera Viewfinder, Light Leak
export function renderGlobalOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: OverlayEffect,
  currentTime: number,
  width: number,
  height: number
) {
  if (!overlay || overlay === 'none') return;

  ctx.save();

  if (overlay === 'grain') {
    // Fast 35mm film grain simulation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    const numSpecks = Math.floor((width * height) / 3500);
    for (let i = 0; i < numSpecks; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      const gs = Math.random() * 2 + 1;
      ctx.fillRect(gx, gy, gs, gs);
    }
  } else if (overlay === 'vhs') {
    // VHS scanlines & retro timestamp
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // Retro VHS OSD text
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = 'rgba(0, 255, 100, 0.8)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'left';
    ctx.fillText('PLAY ▶ 00:0' + currentTime.toFixed(1), 32, 60);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FF4444';
    ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
    ctx.fillText('REC ●', width - 32, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('OCT 22 2026', 32, height - 40);
  } else if (overlay === 'viewfinder') {
    // Camera grid HUD
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    // Corner brackets
    const bracketSize = 36;
    const pad = 24;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + bracketSize);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + bracketSize, pad);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketSize, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + bracketSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(pad, height - pad - bracketSize);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + bracketSize, height - pad);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketSize, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - bracketSize);
    ctx.stroke();

    // Center Crosshair
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Viewfinder info text
    ctx.font = '600 13px Inter, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('4K RAW • 60FPS • ISO 200', pad + 10, height - pad - 12);
  } else if (overlay === 'light-leak') {
    // Golden sun light leak sweeping from corner
    const grad = ctx.createRadialGradient(width * 0.85, 0, 20, width * 0.85, 0, width * 0.75);
    grad.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
    grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// Render a single frame to the canvas
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  clips: MediaClip[],
  textOverlays: TextOverlay[],
  currentTime: number,
  dimensions: CanvasDimensions,
  globalOverlay?: OverlayEffect,
  stickerOverlays?: StickerOverlay[],
  backgroundColor?: string,
  backgroundGradient?: string[]
) {
  const { width, height } = dimensions;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Render background (gradient, solid color, or dark default)
  if (backgroundGradient && backgroundGradient.length > 1) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    backgroundGradient.forEach((c, idx) => {
      grad.addColorStop(idx / (backgroundGradient.length - 1), c);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#0A0D14';
    ctx.fillRect(0, 0, width, height);
  }

  if (clips.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No clips added to timeline', width / 2, height / 2);

    if (textOverlays) {
      for (const textItem of textOverlays) {
        if (currentTime >= textItem.startTime && currentTime <= textItem.startTime + textItem.duration) {
          renderTextOverlay(ctx, textItem, currentTime, width, height);
        }
      }
    }
    if (stickerOverlays) {
      for (const sticker of stickerOverlays) {
        renderStickerOverlay(ctx, sticker, currentTime, width, height);
      }
    }
    ctx.restore();
    return;
  }

  const active = getClipAtTime(clips, currentTime);
  if (!active) {
    ctx.restore();
    return;
  }

  const { clip, localTime, progress, isNearEnd, nextClip, transitionProgress } = active;

  // Helper to draw a specific clip
  const drawClipToCtx = (
    targetCtx: CanvasRenderingContext2D,
    targetClip: MediaClip,
    timeInClip: number,
    clipProgress: number
  ) => {
    targetCtx.save();
    applyFilter(targetCtx, targetClip.filter);

    const motion = targetClip.motion || (targetClip.type === 'photo' ? 'zoom-in' : 'none');

    if (targetClip.type === 'photo') {
      const img = mediaCache.getCachedImage(targetClip.src);
      if (img && img.complete) {
        drawMediaFitted(
          targetCtx,
          img,
          img.naturalWidth || 720,
          img.naturalHeight || 1280,
          width,
          height,
          targetClip.fit,
          motion,
          clipProgress
        );
      } else {
        mediaCache.getImage(targetClip.src);
      }
    } else {
      const video = mediaCache.getVideo(targetClip.src);
      if (video) {
        const speed = targetClip.speed || 1;
        const trimStart = targetClip.trimStart || 0;
        const trimEnd =
          targetClip.trimEnd && targetClip.trimEnd > trimStart
            ? targetClip.trimEnd
            : (video.duration || targetClip.duration);
        const playableDuration = Math.max(0.1, trimEnd - trimStart);
        const targetVideoTime = trimStart + ((timeInClip * speed) % playableDuration);

        if (Math.abs(video.currentTime - targetVideoTime) > 0.15) {
          video.currentTime = targetVideoTime;
        }

        video.muted = targetClip.muted || false;
        const vol = targetClip.volume !== undefined ? targetClip.volume : 1;
        video.volume = Math.max(0, Math.min(1, vol > 1 ? vol / 100 : vol));
        if (targetClip.speed) {
          video.playbackRate = targetClip.speed;
        }

        drawMediaFitted(
          targetCtx,
          video,
          video.videoWidth || 720,
          video.videoHeight || 1280,
          width,
          height,
          targetClip.fit,
          'none',
          0
        );
      }
    }
    targetCtx.restore();
  };

  // Transition handling
  const transitionType: TransitionType = clip.transition || 'none';

  if (isNearEnd && nextClip && transitionType !== 'none') {
    const off1 = document.createElement('canvas');
    off1.width = width;
    off1.height = height;
    const ctx1 = off1.getContext('2d')!;
    drawClipToCtx(ctx1, clip, localTime, progress);

    const off2 = document.createElement('canvas');
    off2.width = width;
    off2.height = height;
    const ctx2 = off2.getContext('2d')!;
    drawClipToCtx(ctx2, nextClip, 0, 0);

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
        const scale1 = 1 + p * 0.4;
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
        drawClipToCtx(ctx, clip, localTime, progress);
        break;
    }
  } else {
    drawClipToCtx(ctx, clip, localTime, progress);
  }

  // Draw Global Aesthetic Overlay (Grain, VHS, Viewfinder, Light Leak)
  if (globalOverlay) {
    renderGlobalOverlay(ctx, globalOverlay, currentTime, width, height);
  }

  // Draw Text Overlays
  for (const textItem of textOverlays) {
    if (currentTime >= textItem.startTime && currentTime <= textItem.startTime + textItem.duration) {
      renderTextOverlay(ctx, textItem, currentTime, width, height);
    }
  }

  // Draw Sticker Overlays
  if (stickerOverlays) {
    for (const sticker of stickerOverlays) {
      renderStickerOverlay(ctx, sticker, currentTime, width, height);
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

  const targetX = (item.x <= 1 && item.x > 0 ? item.x * canvasWidth : (item.x / 100) * canvasWidth);
  const targetY = (item.y <= 1 && item.y > 0 ? item.y * canvasHeight : (item.y / 100) * canvasHeight) + offsetY;

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

  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = item.color;
  ctx.fillText(displayText, 0, 0);

  // Render Underline
  if (item.underline) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = Math.max(2, Math.round(fontSize / 14));
    let startX = 0;
    let endX = textWidth;
    if (item.align === 'center') {
      startX = -textWidth / 2;
      endX = textWidth / 2;
    } else if (item.align === 'right') {
      startX = -textWidth;
      endX = 0;
    }
    const underlineY = fontSize * 0.45;
    ctx.moveTo(startX, underlineY);
    ctx.lineTo(endX, underlineY);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// Render emoji sticker overlay with rotation & scaling
export function renderStickerOverlay(
  ctx: CanvasRenderingContext2D,
  item: StickerOverlay,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (item.startTime !== undefined && item.duration !== undefined) {
    if (currentTime < item.startTime || currentTime > item.startTime + item.duration) {
      return;
    }
  }

  ctx.save();
  const targetX = (item.x <= 1 ? item.x : item.x / 100) * canvasWidth;
  const targetY = (item.y <= 1 ? item.y : item.y / 100) * canvasHeight;
  const scaleFactor = canvasWidth / 720;
  const size = Math.round((item.size || 60) * scaleFactor);

  ctx.translate(targetX, targetY);
  if (item.rotation) {
    ctx.rotate((item.rotation * Math.PI) / 180);
  }

  ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillText(item.emoji, 0, 0);
  ctx.restore();
}
