import React from 'react';
import { MediaClip, TextOverlay, FilterType, TransitionType, TextAnimation, MotionEffect, OverlayEffect } from '../types';
import { Sliders, Sparkles, Trash2, Copy, MoveHorizontal, Palette, Eye, Music, Layers, Zap, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface StudioSidePanelProps {
  selectedClip: MediaClip | null;
  selectedText: TextOverlay | null;
  onUpdateClip: (clip: MediaClip) => void;
  onUpdateText: (text: TextOverlay) => void;
  onDuplicateClip: (clip: MediaClip) => void;
  onDeleteClip: (id: string) => void;
  onDeleteText: (id: string) => void;
  onCloseSelection: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAudioModal: () => void;
  onOpenOverlayModal: () => void;
  onAutoSyncBeat: () => void;
  globalOverlay?: OverlayEffect;
  totalDuration: number;
}

export const StudioSidePanel: React.FC<StudioSidePanelProps> = ({
  selectedClip,
  selectedText,
  onUpdateClip,
  onUpdateText,
  onDuplicateClip,
  onDeleteClip,
  onDeleteText,
  onCloseSelection,
  isCollapsed,
  onToggleCollapse,
  onOpenAudioModal,
  onOpenOverlayModal,
  onAutoSyncBeat,
  globalOverlay = 'none',
  totalDuration,
}) => {
  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'normal', label: 'Original' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'noir', label: 'Noir B&W' },
    { id: 'warm', label: 'Warm' },
    { id: 'cyberpunk', label: 'Cyber' },
    { id: 'dramatic', label: 'Cinema' },
  ];

  const TRANSITIONS: { id: TransitionType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'crossfade', label: 'Crossfade' },
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'slide-left', label: 'Slide Left' },
    { id: 'fade-black', label: 'Fade Black' },
    { id: 'flash', label: 'Flash' },
  ];

  const MOTIONS: { id: MotionEffect; label: string }[] = [
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'zoom-out', label: 'Zoom Out' },
    { id: 'pan-right', label: 'Pan Right' },
    { id: 'none', label: 'Static' },
  ];

  const FONTS = [
    { id: 'Outfit', label: 'Outfit' },
    { id: 'Inter', label: 'Inter' },
    { id: 'Bebas Neue', label: 'Bebas' },
    { id: 'Playfair Display', label: 'Playfair' },
  ];

  const ANIMATIONS: { id: TextAnimation; label: string }[] = [
    { id: 'pop', label: 'Pop' },
    { id: 'slide-up', label: 'Slide' },
    { id: 'fade', label: 'Fade' },
    { id: 'typewriter', label: 'Type' },
  ];

  if (isCollapsed) {
    return (
      <div className="w-10 h-full border-l border-slate-800 bg-[#0E131F] flex flex-col items-center justify-between py-2 shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-400 transition"
          title="Expand Studio Options"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="rotate-90 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
          Studio Options
        </div>
        <div className="w-2 h-2 rounded-full bg-pink-500" />
      </div>
    );
  }

  return (
    <div className="w-80 md:w-96 h-full border-l border-slate-800 bg-[#0E131F] flex flex-col shrink-0 select-none overflow-hidden">
      {/* Top Header of the Down-and-Side Bar */}
      <div className="h-8 px-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Sliders className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
            {selectedClip
              ? `Edit: ${selectedClip.title}`
              : selectedText
              ? 'Edit Caption'
              : 'Studio Options'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(selectedClip || selectedText) && (
            <button
              onClick={onCloseSelection}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Deselect"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Minimize / Collapse Button to side */}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-pink-400 hover:bg-slate-800 transition flex items-center gap-0.5 text-[10px]"
            title="Minimize Studio Options"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content of the Down-and-Side Panel */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 text-xs scrollbar-thin">
        {/* CASE 1: MEDIA CLIP SELECTED */}
        {selectedClip && (
          <div className="space-y-2.5">
            {/* Duration slider */}
            <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Duration</span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="0.4"
                  max="10.0"
                  step="0.1"
                  value={selectedClip.duration}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, duration: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
              <span className="text-pink-400 font-mono font-bold text-[11px]">
                {selectedClip.duration.toFixed(1)}s
              </span>
            </div>

            {/* Ken Burns Motion & Fit */}
            <div className="grid grid-cols-2 gap-2">
              {selectedClip.type === 'photo' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-pink-400" />
                    Motion
                  </span>
                  <select
                    value={selectedClip.motion || 'zoom-in'}
                    onChange={(e) =>
                      onUpdateClip({ ...selectedClip, motion: e.target.value as MotionEffect })
                    }
                    className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                  >
                    {MOTIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Aspect Fit</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'cover' })}
                    className={`py-1 rounded-md text-[10px] font-semibold border transition ${
                      selectedClip.fit === 'cover'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'contain' })}
                    className={`py-1 rounded-md text-[10px] font-semibold border transition ${
                      selectedClip.fit === 'contain'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fit
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Transition Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-pink-400" />
                  Color Filter
                </span>
                <select
                  value={selectedClip.filter}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, filter: e.target.value as FilterType })
                  }
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                >
                  {FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <MoveHorizontal className="w-3 h-3 text-pink-400" />
                  Transition
                </span>
                <select
                  value={selectedClip.transition}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, transition: e.target.value as TransitionType })
                  }
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duplicate & Delete Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
              <button
                onClick={() => onDuplicateClip(selectedClip)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
              >
                <Copy className="w-3 h-3" />
                Duplicate
              </button>
              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition border border-rose-500/30"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: TEXT OVERLAY SELECTED */}
        {selectedText && (
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400">Caption Text</span>
              <input
                type="text"
                value={selectedText.text}
                onChange={(e) => onUpdateText({ ...selectedText, text: e.target.value })}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:border-pink-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Font</span>
                <select
                  value={selectedText.fontFamily}
                  onChange={(e) => onUpdateText({ ...selectedText, fontFamily: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-white"
                >
                  {FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Animation</span>
                <select
                  value={selectedText.animation}
                  onChange={(e) =>
                    onUpdateText({ ...selectedText, animation: e.target.value as TextAnimation })
                  }
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-white"
                >
                  {ANIMATIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {['#FFFFFF', '#F43F5E', '#38BDF8', '#FBBF24'].map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateText({ ...selectedText, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full border transition ${
                      selectedText.color === c ? 'border-pink-500 scale-125' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => onDeleteText(selectedText.id)}
                className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-[10px] font-semibold"
              >
                Delete Text
              </button>
            </div>
          </div>
        )}

        {/* CASE 3: NO CLIP SELECTED -> SHOW QUICK STUDIO OPTIONS */}
        {!selectedClip && !selectedText && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Studio Actions
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenAudioModal}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 text-left transition flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-pink-400 font-bold text-xs">
                  <Music className="w-3.5 h-3.5" />
                  Add Audio
                </div>
                <p className="text-[10px] text-slate-400">Upload or pick beats</p>
              </button>

              <button
                onClick={onOpenOverlayModal}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                  Add Overlay
                </div>
                <p className="text-[10px] text-slate-400">
                  {globalOverlay !== 'none' ? globalOverlay : 'Grain / VHS / Lens'}
                </p>
              </button>
            </div>

            <button
              onClick={onAutoSyncBeat}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ⚡ 1-Click Auto Beat-Sync
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              Click any clip in the timeline to inspect its parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
