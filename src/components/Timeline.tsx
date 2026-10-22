import React, { useRef } from 'react';
import { MediaClip, TextOverlay, AudioTrack } from '../types';
import { Film, Type, Music, ChevronLeft, ChevronRight, Plus, Minus, Trash2, Sliders, Layers } from 'lucide-react';

interface TimelineProps {
  clips: MediaClip[];
  textOverlays: TextOverlay[];
  audioTrack: AudioTrack | null;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onMoveClip: (index: number, direction: 'left' | 'right') => void;
  onUpdateClipDuration: (id: string, delta: number) => void;
  onDeleteClip: (id: string) => void;
  onDeleteText: (id: string) => void;
  onOpenAudioModal?: () => void;
  onOpenOverlayModal?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  textOverlays,
  audioTrack,
  currentTime,
  totalDuration,
  onSeek,
  selectedClipId,
  onSelectClip,
  selectedTextId,
  onSelectText,
  onMoveClip,
  onUpdateClipDuration,
  onDeleteClip,
  onDeleteText,
  onOpenAudioModal,
  onOpenOverlayModal,
}) => {
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Zoom scale: pixels per second
  const pxPerSec = 48;
  const timelineWidth = Math.max(800, (totalDuration + 2) * pxPerSec);

  // Handle timeline scrubber drag/click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / pxPerSec));
    onSeek(newTime);
  };

  const rulerTicks = [];
  const maxSeconds = Math.ceil(totalDuration) + 2;
  for (let s = 0; s <= maxSeconds; s++) {
    rulerTicks.push(s);
  }

  return (
    <div className="h-60 border-t border-slate-800 bg-[#0B0F17] flex flex-col shrink-0 select-none z-20">
      {/* Timeline Action Header */}
      <div className="h-9 px-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-pink-400" />
            Timeline
          </span>
          <span className="text-slate-500">•</span>
          <span>{clips.length} Clips</span>
          <span className="text-slate-500">•</span>
          <span>{textOverlays.length} Text</span>
          {audioTrack ? (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-medium">1 Soundtrack Active</span>
            </>
          ) : (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500 italic">No audio track</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenAudioModal && (
            <button
              onClick={onOpenAudioModal}
              className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700"
            >
              <Music className="w-3 h-3" />
              {audioTrack ? 'Change Audio' : '+ Add Audio'}
            </button>
          )}
          {onOpenOverlayModal && (
            <button
              onClick={onOpenOverlayModal}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700"
            >
              <Layers className="w-3 h-3" />
              Overlays
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Multi-track Container */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-pointer scrollbar-thin"
      >
        <div style={{ width: `${timelineWidth}px` }} className="relative h-full py-2 px-3">
          {/* Time Ruler */}
          <div className="h-6 border-b border-slate-800/80 relative flex items-end mb-2 select-none">
            {rulerTicks.map((sec) => (
              <div
                key={sec}
                style={{ left: `${sec * pxPerSec}px` }}
                className="absolute flex flex-col items-start"
              >
                <div className="w-px h-2 bg-slate-700" />
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {sec}s
                </span>
              </div>
            ))}
          </div>

          {/* PLAYHEAD SCRUBBER (Spans all tracks) */}
          <div
            style={{ left: `${currentTime * pxPerSec + 12}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400 via-rose-500 to-pink-500 z-30 pointer-events-none shadow-[0_0_12px_rgba(236,72,153,0.8)]"
          >
            {/* Playhead Head */}
            <div className="w-3.5 h-4 -ml-1.5 -top-1 absolute bg-pink-500 rounded-b-md shadow-md flex items-center justify-center">
              <div className="w-1 h-2 bg-white rounded-full opacity-80" />
            </div>
          </div>

          {/* TRACK 1: TEXT OVERLAYS */}
          <div className="h-8 mb-2 relative flex items-center bg-slate-900/40 rounded-lg border border-slate-800/50 px-1">
            <div className="w-6 shrink-0 flex items-center justify-center text-slate-500">
              <Type className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="relative flex-1 h-full">
              {textOverlays.map((item) => {
                const isSelected = selectedTextId === item.id;
                const width = Math.max(50, item.duration * pxPerSec);
                const left = item.startTime * pxPerSec;

                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectText(item.id);
                      onSelectClip(null);
                    }}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-xs font-semibold shadow transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500 text-white ring-2 ring-pink-400'
                        : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50'
                    }`}
                  >
                    <span className="truncate text-[11px] font-medium mr-1">
                      {item.text}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteText(item.id);
                      }}
                      className="p-0.5 rounded hover:bg-black/30 text-indigo-300 hover:text-white"
                      title="Delete text"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: MEDIA CLIPS (PHOTOS & VIDEOS) */}
          <div className="h-20 mb-2 relative flex items-center bg-slate-900/60 rounded-xl border border-slate-800/80 p-1 gap-1">
            <div className="w-6 shrink-0 flex flex-col items-center justify-center text-slate-500">
              <Film className="w-4 h-4 text-rose-400 mb-1" />
            </div>

            <div className="flex items-center gap-1.5 h-full">
              {clips.map((clip, index) => {
                const isSelected = selectedClipId === clip.id;
                const width = Math.max(80, clip.duration * pxPerSec);

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id);
                      onSelectText(null);
                    }}
                    style={{ width: `${width}px` }}
                    className={`h-full rounded-lg overflow-hidden relative group cursor-pointer border-2 transition-all shrink-0 flex flex-col justify-between p-1.5 ${
                      isSelected
                        ? 'border-pink-500 bg-slate-800 ring-2 ring-pink-500/40 shadow-lg'
                        : 'border-slate-700/80 bg-slate-800/80 hover:border-slate-500'
                    }`}
                  >
                    {/* Background Thumbnail */}
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition pointer-events-none"
                    />

                    {/* Clip Top Bar */}
                    <div className="relative z-10 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white truncate max-w-[70px]">
                        {clip.title}
                      </span>
                      <span className="px-1 py-0.5 rounded bg-black/60 text-slate-300 font-mono text-[9px]">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>

                    {/* Clip Bottom Bar: Move and Resize Controls */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] mt-auto">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveClip(index, 'left');
                          }}
                          disabled={index === 0}
                          className="p-0.5 rounded bg-black/50 hover:bg-black text-slate-300 disabled:opacity-30"
                          title="Move clip left"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveClip(index, 'right');
                          }}
                          disabled={index === clips.length - 1}
                          className="p-0.5 rounded bg-black/50 hover:bg-black text-slate-300 disabled:opacity-30"
                          title="Move clip right"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Duration adjustments */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateClipDuration(clip.id, -0.5);
                          }}
                          className="p-0.5 rounded bg-black/50 hover:bg-black text-slate-300"
                          title="Shorten duration (-0.5s)"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateClipDuration(clip.id, 0.5);
                          }}
                          className="p-0.5 rounded bg-black/50 hover:bg-black text-slate-300"
                          title="Extend duration (+0.5s)"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClip(clip.id);
                          }}
                          className="p-0.5 rounded bg-rose-500/30 hover:bg-rose-500 text-rose-200 hover:text-white"
                          title="Delete clip"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Transition Badge */}
                    {index < clips.length - 1 && (
                      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 px-1 py-0.5 rounded bg-pink-500 text-white font-mono text-[8px] font-bold shadow pointer-events-none">
                        {clip.transition}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: AUDIO SOUNDTRACK */}
          {audioTrack ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAudioModal) onOpenAudioModal();
              }}
              className="h-8 relative flex items-center bg-emerald-950/30 rounded-lg border border-emerald-800/40 px-1 cursor-pointer hover:border-emerald-600 transition"
              title="Click to edit or change audio"
            >
              <div className="w-6 shrink-0 flex items-center justify-center text-emerald-400">
                <Music className="w-3.5 h-3.5" />
              </div>
              <div
                style={{ width: `${Math.min(totalDuration, audioTrack.duration) * pxPerSec}px` }}
                className="h-6 bg-emerald-900/60 border border-emerald-600/50 rounded-md px-2 flex items-center justify-between text-xs text-emerald-200"
              >
                <span className="font-semibold text-[11px] truncate">
                  🎵 {audioTrack.title}
                </span>
                <span className="text-[10px] font-mono text-emerald-300">
                  {Math.round(audioTrack.volume * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAudioModal) onOpenAudioModal();
              }}
              className="h-8 relative flex items-center bg-slate-900/40 rounded-lg border border-dashed border-slate-700/60 px-3 cursor-pointer hover:border-pink-500/60 transition"
            >
              <Music className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <span className="text-xs text-slate-400 hover:text-pink-400 font-medium">
                + Click here to add an audio track or soundtrack
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
