import React, { useRef, useEffect } from 'react';
import { ReelProject, TextOverlay } from '../types';
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    renderFrame(ctx, project.clips, project.textOverlays, currentTime, dims);
  }, [project, currentTime]);

  // Format seconds to mm:ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
  };

  const getAspectRatioClasses = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'w-[320px] sm:w-[350px] aspect-[9/16] max-h-[66vh]';
      case '1:1':
        return 'w-[340px] sm:w-[420px] aspect-square max-h-[66vh]';
      case '16:9':
        return 'w-[520px] sm:w-[620px] aspect-video max-h-[66vh]';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#0A0D14] overflow-hidden select-none relative">
      {/* Background ambient lighting */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none -top-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none -bottom-20" />

      {/* Smartphone Device Frame */}
      <div className="relative group flex items-center justify-center">
        <div
          className={`relative ${getAspectRatioClasses()} rounded-[40px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-black/80 border border-slate-700/60 flex flex-col`}
        >
          {/* Inner bezel */}
          <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex items-center justify-center border border-black shadow-inner">
            {/* Dynamic Island / Camera Notch */}
            {project.aspectRatio === '9:16' && (
              <div className="absolute top-2.5 z-20 flex items-center justify-center">
                <div className="h-4 w-20 bg-black/90 border border-slate-800 rounded-full flex items-center justify-between px-2 shadow">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
                </div>
              </div>
            )}

            {/* Live Render Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover cursor-pointer"
              onClick={onTogglePlay}
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
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition pointer-events-auto"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white ml-1" />
                )}
              </button>
            </div>

            {/* Social Reel UI Mockup Overlay (Watermark & Like Button on side) */}
            {project.aspectRatio === '9:16' && (
              <div className="absolute right-3 bottom-14 flex flex-col items-center gap-3.5 z-10 pointer-events-none opacity-80">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow">
                  ❤️
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow">
                  💬
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow">
                  ↗️
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transport Bar Controls below Phone */}
      <div className="mt-4 flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg z-20">
        <button
          onClick={() => onSeek(0)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Rewind to start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 transition active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Timecode */}
        <div className="font-mono text-xs text-slate-300 font-medium tracking-wider">
          <span className="text-pink-400">{formatTime(currentTime)}</span>
          <span className="text-slate-500"> / </span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-lg transition ${
            isMuted
              ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Loop Toggle */}
        <button
          onClick={onToggleLoop}
          className={`p-1.5 rounded-lg transition ${
            isLooping
              ? 'text-pink-400 hover:text-pink-300 bg-pink-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isLooping ? 'Disable Loop' : 'Enable Loop'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
