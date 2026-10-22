import React from 'react';
import { MediaClip, TextOverlay, FilterType, TransitionType, TextAnimation, MotionEffect, OverlayEffect } from '../types';
import { Sliders, Sparkles, Trash2, Copy, MoveHorizontal, Palette, Eye, ChevronDown, ChevronUp, Layers, Music, Zap, Type } from 'lucide-react';

interface BottomEditPanelProps {
  selectedClip: MediaClip | null;
  selectedText: TextOverlay | null;
  onUpdateClip: (clip: MediaClip) => void;
  onUpdateText: (text: TextOverlay) => void;
  onDuplicateClip: (clip: MediaClip) => void;
  onDeleteClip: (id: string) => void;
  onDeleteText: (id: string) => void;
  onCloseSelection: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onOpenAudioModal: () => void;
  onOpenOverlayModal: () => void;
  onAutoSyncBeat: () => void;
  globalOverlay?: OverlayEffect;
  totalDuration: number;
}

export const BottomEditPanel: React.FC<BottomEditPanelProps> = ({
  selectedClip,
  selectedText,
  onUpdateClip,
  onUpdateText,
  onDuplicateClip,
  onDeleteClip,
  onDeleteText,
  onCloseSelection,
  isMinimized,
  onToggleMinimize,
  onOpenAudioModal,
  onOpenOverlayModal,
  onAutoSyncBeat,
  globalOverlay = 'none',
  totalDuration,
}) => {
  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'normal', label: 'Original' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'vintage', label: 'Vintage 90s' },
    { id: 'noir', label: 'Noir B&W' },
    { id: 'warm', label: 'Golden Hour' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'dramatic', label: 'Cinematic' },
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
    { id: 'slide-up', label: 'Slide Up' },
    { id: 'fade', label: 'Fade' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'none', label: 'None' },
  ];

  // Header Title
  const getTitle = () => {
    if (selectedClip) return `Edit ${selectedClip.type === 'photo' ? 'Photo' : 'Video'}: "${selectedClip.title}"`;
    if (selectedText) return `Edit Caption: "${selectedText.text.slice(0, 16)}..."`;
    return 'Video Studio Options';
  };

  return (
    <div className="border-t border-slate-800 bg-[#0E131F]/95 backdrop-blur-md flex flex-col shrink-0 select-none z-20 shadow-xl transition-all duration-200">
      {/* Bar / Header with Minimize Option */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              {getTitle()}
            </span>
          </div>

          {/* Quick summary badges when minimized */}
          {isMinimized && selectedClip && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-pink-300 font-mono">
                {selectedClip.duration.toFixed(1)}s
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                {selectedClip.filter}
              </span>
              {selectedClip.motion && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                  {selectedClip.motion}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Minimize Button */}
        <div className="flex items-center gap-2">
          {/* Direct Buttons for Audio, Overlay, Beat Sync */}
          <button
            onClick={onOpenAudioModal}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Add or manage audio track"
          >
            <Music className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Add Audio</span>
          </button>

          <button
            onClick={onOpenOverlayModal}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Add or choose visual overlay (Grain, VHS, Light Leak)"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Overlay</span>
            {globalOverlay !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={onAutoSyncBeat}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center gap-1 transition"
            title="Auto-sync clips to music beat"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="hidden md:inline">Beat Sync</span>
          </button>

          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={onToggleMinimize}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 flex items-center gap-1.5 transition"
            title={isMinimized ? 'Expand editing panel' : 'Minimize editing panel to view full preview'}
          >
            {isMinimized ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Expand Edit</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Minimize</span>
              </>
            )}
          </button>

          {(selectedClip || selectedText) && (
            <button
              onClick={onCloseSelection}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-1 rounded hover:bg-slate-800"
              title="Deselect"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded Editing Body */}
      {!isMinimized && (
        <div className="p-3 overflow-x-auto overflow-y-hidden max-h-56">
          {/* CASE 1: CLIP SELECTED */}
          {selectedClip && (
            <div className="flex items-center gap-6 text-xs min-w-max">
              {/* Duration Slider */}
              <div className="flex flex-col gap-1 w-44">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-slate-400">Duration</span>
                  <span className="text-pink-400 font-mono font-bold">
                    {selectedClip.duration.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="10.0"
                  step="0.1"
                  value={selectedClip.duration}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, duration: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Ken Burns Motion (if photo) */}
              {selectedClip.type === 'photo' && (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-pink-400" />
                    Motion
                  </span>
                  <div className="flex items-center gap-1">
                    {MOTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onUpdateClip({ ...selectedClip, motion: m.id })}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                          (selectedClip.motion || 'zoom-in') === m.id
                            ? 'bg-pink-500 text-white border-pink-500 shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Grade Filter */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  Color Filter
                </span>
                <div className="flex items-center gap-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateClip({ ...selectedClip, filter: f.id })}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                        selectedClip.filter === f.id
                          ? 'bg-pink-500 text-white border-pink-500 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transition to Next Clip */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />
                  Transition
                </span>
                <div className="flex items-center gap-1">
                  {TRANSITIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateClip({ ...selectedClip, transition: t.id })}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                        selectedClip.transition === t.id
                          ? 'bg-pink-500 text-white border-pink-500 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Fit Mode */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400">Fit</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'cover' })}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                      selectedClip.fit === 'cover'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'contain' })}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                      selectedClip.fit === 'contain'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Duplicate / Delete Buttons */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <button
                  onClick={() => onDuplicateClip(selectedClip)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                  title="Duplicate clip"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button
                  onClick={() => onDeleteClip(selectedClip.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition border border-rose-500/30"
                  title="Delete clip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: TEXT OVERLAY SELECTED */}
          {selectedText && (
            <div className="flex items-center gap-6 text-xs min-w-max">
              {/* Text Input */}
              <div className="flex flex-col gap-1 w-52">
                <span className="font-semibold text-slate-400">Caption Text</span>
                <input
                  type="text"
                  value={selectedText.text}
                  onChange={(e) => onUpdateText({ ...selectedText, text: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 font-semibold"
                />
              </div>

              {/* Font Family */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400">Font</span>
                <div className="flex items-center gap-1">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => onUpdateText({ ...selectedText, fontFamily: font.id })}
                      className={`px-2 py-1 rounded-md text-[11px] border transition ${
                        selectedText.fontFamily === font.id
                          ? 'bg-pink-500 text-white border-pink-500 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="flex flex-col gap-1 w-32">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold text-slate-400">Size</span>
                  <span className="text-pink-400 font-mono font-bold">{selectedText.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={selectedText.fontSize}
                  onChange={(e) =>
                    onUpdateText({ ...selectedText, fontSize: parseInt(e.target.value) })
                  }
                  className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Text Animation */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Animation
                </span>
                <div className="flex items-center gap-1">
                  {ANIMATIONS.map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => onUpdateText({ ...selectedText, animation: anim.id })}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                        selectedText.animation === anim.id
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400">Color</span>
                <div className="flex items-center gap-1.5">
                  {['#FFFFFF', '#F43F5E', '#38BDF8', '#FBBF24', '#10B981'].map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateText({ ...selectedText, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        selectedText.color === c ? 'border-pink-500 scale-110' : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => onDeleteText(selectedText.id)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}

          {/* CASE 3: NO SELECTION */}
          {!selectedClip && !selectedText && (
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">
                  Click any clip or text caption in the timeline below to open its edit controls.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenAudioModal}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-400 font-bold flex items-center gap-1.5"
                >
                  <Music className="w-4 h-4" />
                  Choose Soundtrack
                </button>
                <button
                  onClick={onOpenOverlayModal}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  Choose Overlay Effect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
