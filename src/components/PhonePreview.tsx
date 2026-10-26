import React, { useRef, useEffect, useState } from 'react';
import { ReelProject, TextOverlay, StickerOverlay } from '../types';
import { getCanvasDimensions, renderFrame } from '../utils/engine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Repeat } from 'lucide-react';

interface PhonePreviewProps {
  project: ReelProject;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  totalDuration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  onSelectText?: (text: TextOverlay) => void;
  onUpdateTextPosition?: (id: string, x: number, y: number) => void;
  onSelectSticker?: (sticker: StickerOverlay) => void;
  onUpdateStickerPosition?: (id: string, x: number, y: number) => void;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  project,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  totalDuration,
  isMuted,
  onToggleMute,
  isLooping,
  onToggleLoop,
  onSelectText,
  onUpdateTextPosition,
  onSelectSticker,
  onUpdateStickerPosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragTargetRef = useRef<{ type: 'text' | 'sticker'; id: string } | null>(null);
  const dragStartPosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Sync canvas dimensions and render active frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dims = getCanvasDimensions(project.aspectRatio);
    if (canvas.width !== dims.width || canvas.height !== dims.height) {
      canvas.width = dims.width;
      canvas.height = dims.height;
    }

    renderFrame(
      ctx,
      project.clips,
      project.textOverlays,
      currentTime,
      dims,
      project.globalOverlay,
      project.stickerOverlays,
      project.backgroundColor,
      project.backgroundGradient
    );
  }, [project, currentTime]);

  // Pointer Down: Hit test stickers and text overlays
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickCanvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickCanvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    dragStartPosRef.current = { clientX: e.clientX, clientY: e.clientY };
    hasMovedRef.current = false;

    // 1. Check Sticker Overlays first (top-most first)
    if (project.stickerOverlays && project.stickerOverlays.length > 0) {
      for (let i = project.stickerOverlays.length - 1; i >= 0; i--) {
        const sticker = project.stickerOverlays[i];
        if (sticker.startTime !== undefined && sticker.duration !== undefined) {
          if (currentTime < sticker.startTime || currentTime > sticker.startTime + sticker.duration) {
            continue;
          }
        }
        const sx = (sticker.x <= 1 ? sticker.x : sticker.x / 100) * canvas.width;
        const sy = (sticker.y <= 1 ? sticker.y : sticker.y / 100) * canvas.height;
        const scaleFactor = canvas.width / 720;
        const size = (sticker.size || 60) * scaleFactor;
        const dist = Math.hypot(clickCanvasX - sx, clickCanvasY - sy);

        if (dist <= size * 0.8 + 15) {
          dragTargetRef.current = { type: 'sticker', id: sticker.id };
          setIsDragging(true);
          onSelectSticker?.(sticker);
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    // 2. Check Text Overlays (top-most visible first)
    if (project.textOverlays && project.textOverlays.length > 0) {
      for (let i = project.textOverlays.length - 1; i >= 0; i--) {
        const text = project.textOverlays[i];
        if (currentTime < text.startTime || currentTime > text.startTime + text.duration) {
          continue;
        }

        const tx = (text.x <= 1 ? text.x : text.x / 100) * canvas.width;
        const ty = (text.y <= 1 ? text.y : text.y / 100) * canvas.height;
        const scaleFactor = canvas.width / 720;
        const fontSize = Math.round(text.fontSize * scaleFactor);

        let textW = text.text.length * fontSize * 0.6;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${text.italic ? 'italic ' : ''}${text.bold ? 'bold ' : ''}${fontSize}px "${text.fontFamily}", sans-serif`;
          textW = ctx.measureText(text.text).width;
        }

        const padX = 30 * scaleFactor;
        const padY = 24 * scaleFactor;
        let minX = tx - textW / 2 - padX;
        let maxX = tx + textW / 2 + padX;
        if (text.align === 'left') {
          minX = tx - padX;
          maxX = tx + textW + padX;
        } else if (text.align === 'right') {
          minX = tx - textW - padX;
          maxX = tx + padX;
        }
        const minY = ty - fontSize * 0.9 - padY;
        const maxY = ty + fontSize * 0.9 + padY;

        if (clickCanvasX >= minX && clickCanvasX <= maxX && clickCanvasY >= minY && clickCanvasY <= maxY) {
          dragTargetRef.current = { type: 'text', id: text.id };
          setIsDragging(true);
          onSelectText?.(text);
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    dragTargetRef.current = null;
  };

  // Pointer Move: Update position of dragged item
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragTargetRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragStartPosRef.current) {
      const dx = Math.abs(e.clientX - dragStartPosRef.current.clientX);
      const dy = Math.abs(e.clientY - dragStartPosRef.current.clientY);
      if (dx > 3 || dy > 3) {
        hasMovedRef.current = true;
      }
    }

    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

    if (dragTargetRef.current.type === 'text') {
      onUpdateTextPosition?.(dragTargetRef.current.id, normX, normY);
    } else if (dragTargetRef.current.type === 'sticker') {
      onUpdateStickerPosition?.(dragTargetRef.current.id, normX, normY);
    }
  };

  // Pointer Up: Release capture and handle click vs drag
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    const hadTarget = dragTargetRef.current !== null;
    const moved = hasMovedRef.current;

    dragTargetRef.current = null;
    dragStartPosRef.current = null;
    setIsDragging(false);

    // If tapped empty space without dragging, toggle play
    if (!hadTarget && !moved) {
      onTogglePlay();
    }
  };

  // Format seconds to mm:ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
  };

  const getAspectRatioClasses = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'h-[min(480px,calc(100vh-270px))] aspect-[9/16] max-w-[85vw]';
      case '1:1':
        return 'h-[min(420px,calc(100vh-270px))] aspect-square max-w-[85vw]';
      case '16:9':
        return 'w-[min(640px,calc(100vw-360px))] aspect-video max-h-[calc(100vh-270px)]';
    }
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 bg-[#0A0D14] flex flex-col items-center justify-center p-2 relative select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-pink-500/10 blur-[130px] pointer-events-none -top-16 left-1/3" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none -bottom-16 right-1/3" />

      {/* Centered Phone Device Container */}
      <div className="flex flex-col items-center justify-center max-h-full">
        {/* Smartphone Device Frame */}
        <div className="relative group flex items-center justify-center shrink-0">
          <div
            className={`relative ${getAspectRatioClasses()} rounded-[36px] p-2 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-black/90 border border-slate-700/60 flex flex-col transition-all duration-200`}
          >
            {/* Inner bezel */}
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center border border-black shadow-inner">
              {/* Dynamic Island / Camera Notch */}
              {project.aspectRatio === '9:16' && (
                <div className="absolute top-2 z-20 flex items-center justify-center">
                  <div className="h-3.5 w-16 bg-black/90 border border-slate-800 rounded-full flex items-center justify-between px-1.5 shadow">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
                  </div>
                </div>
              )}

              {/* Live Render Canvas */}
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover touch-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-pointer'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />

              {/* Play/Pause HUD overlay when paused or hover */}
              <div
                className={`absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
                  !isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition pointer-events-auto"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>
              </div>

              {/* Social Reel UI Mockup Overlay */}
              {project.aspectRatio === '9:16' && (
                <div className="absolute right-2.5 bottom-10 flex flex-col items-center gap-2.5 z-10 pointer-events-none opacity-80">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-[11px] font-bold shadow">
                    ❤️
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-[11px] font-bold shadow">
                    💬
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-[11px] font-bold shadow">
                    ↗️
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transport Bar Controls below Phone */}
        <div className="mt-2 flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl backdrop-blur-md shadow-lg z-20 shrink-0">
          <button
            onClick={() => onSeek(0)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Rewind to start"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-6 h-6 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 transition active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-white" />
            ) : (
              <Play className="w-3 h-3 fill-white ml-0.5" />
            )}
          </button>

          {/* Timecode */}
          <div className="font-mono text-[11px] text-slate-300 font-medium tracking-wider">
            <span className="text-pink-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-500"> / </span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1 rounded transition ${
              isMuted
                ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          {/* Loop Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-1 rounded transition ${
              isLooping
                ? 'text-pink-400 hover:text-pink-300 bg-pink-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isLooping ? 'Disable Loop' : 'Enable Loop'}
          >
            <Repeat className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
