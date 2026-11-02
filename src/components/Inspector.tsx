import React from 'react';
import {
  MediaClip,
  TextOverlay,
  StickerOverlay,
  FilterType,
  TransitionType,
  TextAnimation,
  MotionEffect,
  OverlayEffect,
} from '../types';
import {
  Sliders,
  Trash2,
  Copy,
  MoveHorizontal,
  Palette,
  Eye,
  Music,
  Layers,
  Zap,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
  Gauge,
  Scissors,
  Smile,
  RotateCw,
} from 'lucide-react';

interface InspectorProps {
  // Selection
  selectedClip: MediaClip | null;
  selectedText: TextOverlay | null;
  selectedSticker: StickerOverlay | null;
  // Update handlers
  onUpdateClip: (clip: MediaClip) => void;
  onUpdateText: (text: TextOverlay) => void;
  onUpdateSticker: (sticker: StickerOverlay) => void;
  // Actions
  onDuplicateClip: (clip: MediaClip) => void;
  onDuplicateText: (text: TextOverlay) => void;
  onDuplicateSticker: (sticker: StickerOverlay) => void;
  onDeleteClip: (id: string) => void;
  onDeleteText: (id: string) => void;
  onDeleteSticker: (id: string) => void;
  onAddSticker: (emoji: string) => void;
  onCloseSelection: () => void;
  // Quick actions
  onOpenAudioModal: () => void;
  onOpenOverlayModal: () => void;
  onAutoSyncBeat: () => void;
  // Project props
  globalOverlay?: OverlayEffect;
  totalDuration: number;
  backgroundColor?: string;
  backgroundGradient?: string[];
  onUpdateBackground: (bg: { color?: string; gradient?: string[] }) => void;
  // Collapse
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

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

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

const EMOJI_LIST = ['🔥', '❤️', '✨', '💯', '🎵', '🌟', '💥', '🎉', '👀', '💫', '⚡', '🚀', '😍', '👏', '👑', '🌈'];

const GRADIENT_PRESETS = [
  { name: 'Default Dark', colors: ['#0A0D14', '#1E1B4B'] },
  { name: 'Sunset Glow', colors: ['#F97316', '#EC4899', '#8B5CF6'] },
  { name: 'Cyber Neon', colors: ['#0F172A', '#06B6D4', '#9333EA'] },
  { name: 'Emerald Deep', colors: ['#064E3B', '#059669', '#022C22'] },
  { name: 'Golden Hour', colors: ['#78350F', '#D97706', '#FBBF24'] },
  { name: 'Midnight Violet', colors: ['#18181B', '#3B0764', '#1E1B4B'] },
];

export const Inspector: React.FC<InspectorProps> = ({
  selectedClip,
  selectedText,
  selectedSticker,
  onUpdateClip,
  onUpdateText,
  onUpdateSticker,
  onDuplicateClip,
  onDuplicateText,
  onDuplicateSticker,
  onDeleteClip,
  onDeleteText,
  onDeleteSticker,
  onAddSticker,
  onCloseSelection,
  onOpenAudioModal,
  onOpenOverlayModal,
  onAutoSyncBeat,
  globalOverlay = 'none',
  totalDuration,
  backgroundColor = '#0A0D14',
  backgroundGradient,
  onUpdateBackground,
  isCollapsed,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return <div className="w-0 overflow-hidden shrink-0 transition-all duration-200" />;
  }

  const hasSelection = Boolean(selectedClip || selectedText || selectedSticker);

  return (
    <aside
      className="w-[280px] h-full bg-[#1C1C1C] border-l border-[#2A2A2A] flex flex-col overflow-hidden shrink-0 select-none z-10 transition-all duration-200"
      aria-label="Inspector"
    >
      {/* Header: Context title + close selection + collapse */}
      <div className="h-10 px-3 border-b border-[#2A2A2A] bg-[#181818] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Sliders className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="text-xs font-bold text-white tracking-wide truncate">
            {selectedClip
              ? `Edit: ${selectedClip.title}`
              : selectedText
              ? 'Edit Caption'
              : selectedSticker
              ? `Edit Sticker: ${selectedSticker.emoji}`
              : 'Project Settings'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hasSelection && (
            <button
              onClick={onCloseSelection}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#222222] transition"
              title="Deselect"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-pink-400 hover:bg-[#222222] transition"
            title="Collapse Inspector"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Scrollable property controls */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin">
        {/* CASE 1: MEDIA CLIP SELECTED */}
        {selectedClip && (
          <div className="space-y-3">
            {/* Duration slider */}
            <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                <span className="text-pink-400 font-mono font-bold text-xs">
                  {selectedClip.duration.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="15.0"
                step="0.1"
                value={selectedClip.duration}
                onChange={(e) =>
                  onUpdateClip({ ...selectedClip, duration: parseFloat(e.target.value) })
                }
                className="w-full accent-pink-500 h-1.5 bg-[#222222] rounded-lg cursor-pointer"
              />
            </div>

            {/* Per-Clip Volume & Mute Control */}
            <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  {selectedClip.muted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  )}
                  Clip Volume
                </span>
                <button
                  onClick={() => onUpdateClip({ ...selectedClip, muted: !selectedClip.muted })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                    selectedClip.muted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-[#222222] text-slate-300 border-[#2A2A2A] hover:text-white'
                  }`}
                >
                  {selectedClip.muted ? 'Unmute' : 'Mute'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    selectedClip.muted
                      ? 0
                      : Math.round(
                          selectedClip.volume !== undefined
                            ? selectedClip.volume > 1
                              ? selectedClip.volume
                              : selectedClip.volume * 100
                            : 100
                        )
                  }
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      volume: Number(e.target.value) / 100,
                      muted: false,
                    })
                  }
                  className="w-full accent-pink-500 h-1.5 bg-[#222222] rounded-lg cursor-pointer"
                />
                <span className="text-pink-400 font-mono font-bold text-[10px] w-8 text-right">
                  {selectedClip.muted
                    ? '0%'
                    : `${Math.round(
                        selectedClip.volume !== undefined
                          ? selectedClip.volume > 1
                            ? selectedClip.volume
                            : selectedClip.volume * 100
                          : 100
                      )}%`}
                </span>
              </div>
            </div>

            {/* Clip Speed Control */}
            <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-pink-400" />
                Clip Speed
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateClip({ ...selectedClip, speed: s })}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                      (selectedClip.speed || 1) === s
                        ? 'bg-pink-500 text-white border-pink-500 shadow'
                        : 'bg-[#1C1C1C] border-[#2A2A2A] text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Clip Trim (In / Out points) - Only for video clips */}
            {selectedClip.type === 'video' && (
              <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <Scissors className="w-3.5 h-3.5 text-pink-400" />
                    Clip Trim
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {(selectedClip.trimStart || 0).toFixed(1)}s -{' '}
                    {(selectedClip.trimEnd || selectedClip.duration).toFixed(1)}s
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400">Trim Start (s)</label>
                    <input
                      type="number"
                      min="0"
                      max={Math.max(0, (selectedClip.trimEnd || selectedClip.duration) - 0.2)}
                      step="0.1"
                      value={selectedClip.trimStart || 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        onUpdateClip({ ...selectedClip, trimStart: val });
                      }}
                      className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-1.5 text-xs text-white focus:border-pink-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400">Trim End (s)</label>
                    <input
                      type="number"
                      min={Math.max(0.2, (selectedClip.trimStart || 0) + 0.2)}
                      step="0.1"
                      value={selectedClip.trimEnd || selectedClip.duration}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || selectedClip.duration;
                        onUpdateClip({ ...selectedClip, trimEnd: val });
                      }}
                      className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-1.5 text-xs text-white focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Ken Burns Motion & Fit */}
            <div className="grid grid-cols-2 gap-2">
              {selectedClip.type === 'photo' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <Eye className="w-3 h-3 text-pink-400" />
                    Motion
                  </span>
                  <select
                    value={selectedClip.motion || 'zoom-in'}
                    onChange={(e) =>
                      onUpdateClip({ ...selectedClip, motion: e.target.value as MotionEffect })
                    }
                    className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-2 text-xs text-white focus:border-pink-500 outline-none"
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aspect Fit</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'cover' })}
                    className={`py-2 rounded-lg text-[10px] font-semibold border transition ${
                      selectedClip.fit === 'cover'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-[#141414] border-[#2A2A2A] text-slate-400'
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => onUpdateClip({ ...selectedClip, fit: 'contain' })}
                    className={`py-2 rounded-lg text-[10px] font-semibold border transition ${
                      selectedClip.fit === 'contain'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-[#141414] border-[#2A2A2A] text-slate-400'
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
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Palette className="w-3 h-3 text-pink-400" />
                  Filter
                </span>
                <select
                  value={selectedClip.filter}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, filter: e.target.value as FilterType })
                  }
                  className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-2 text-xs text-white focus:border-pink-500 outline-none"
                >
                  {FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <MoveHorizontal className="w-3 h-3 text-pink-400" />
                  Transition
                </span>
                <select
                  value={selectedClip.transition}
                  onChange={(e) =>
                    onUpdateClip({ ...selectedClip, transition: e.target.value as TransitionType })
                  }
                  className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-2 text-xs text-white focus:border-pink-500 outline-none"
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
            <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A2A]">
              <button
                onClick={() => onDuplicateClip(selectedClip)}
                className="flex-1 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: TEXT OVERLAY SELECTED */}
        {selectedText && (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caption Text</span>
              <input
                type="text"
                value={selectedText.text}
                onChange={(e) => onUpdateText({ ...selectedText, text: e.target.value })}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-pink-500 outline-none font-semibold"
              />
            </div>

            {/* Text Bold / Italic / Underline Toggles */}
            <div className="flex items-center justify-between bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Typography</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateText({ ...selectedText, bold: !selectedText.bold })}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${
                    selectedText.bold
                      ? 'bg-pink-500 text-white border-pink-500 shadow'
                      : 'bg-[#222222] border-[#2A2A2A] text-slate-400 hover:text-white'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => onUpdateText({ ...selectedText, italic: !selectedText.italic })}
                  className={`w-7 h-7 rounded-lg text-xs italic font-serif border transition ${
                    selectedText.italic
                      ? 'bg-pink-500 text-white border-pink-500 shadow'
                      : 'bg-[#222222] border-[#2A2A2A] text-slate-400 hover:text-white'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() =>
                    onUpdateText({ ...selectedText, underline: !selectedText.underline })
                  }
                  className={`w-7 h-7 rounded-lg text-xs underline font-semibold border transition ${
                    selectedText.underline
                      ? 'bg-pink-500 text-white border-pink-500 shadow'
                      : 'bg-[#222222] border-[#2A2A2A] text-slate-400 hover:text-white'
                  }`}
                  title="Underline"
                >
                  U
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Font</span>
                <select
                  value={selectedText.fontFamily}
                  onChange={(e) => onUpdateText({ ...selectedText, fontFamily: e.target.value })}
                  className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-2 text-xs text-white focus:border-pink-500 outline-none"
                >
                  {FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Animation</span>
                <select
                  value={selectedText.animation}
                  onChange={(e) =>
                    onUpdateText({ ...selectedText, animation: e.target.value as TextAnimation })
                  }
                  className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-2 text-xs text-white focus:border-pink-500 outline-none"
                >
                  {ANIMATIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-1.5 bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Text Color
              </span>
              <div className="flex items-center gap-2">
                {['#FFFFFF', '#F43F5E', '#38BDF8', '#FBBF24', '#10B981', '#A855F7'].map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateText({ ...selectedText, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border transition ${
                      selectedText.color === c ? 'border-pink-500 scale-125 shadow-md' : 'border-[#333333]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Duplicate & Delete Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A2A]">
              <button
                onClick={() => onDuplicateText(selectedText)}
                className="flex-1 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDeleteText(selectedText.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* CASE 3: STICKER OVERLAY SELECTED */}
        {selectedSticker && (
          <div className="space-y-3">
            <div className="bg-[#141414] p-3 rounded-xl border border-[#2A2A2A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-1.5 bg-[#222222] rounded-xl border border-[#2A2A2A]">
                  {selectedSticker.emoji}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Emoji Sticker</div>
                  <div className="text-[10px] text-slate-500">Drag directly on canvas</div>
                </div>
              </div>
            </div>

            {/* Size Slider */}
            <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="uppercase tracking-wider">Sticker Size</span>
                <span className="text-pink-400 font-mono">{selectedSticker.size || 60}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="140"
                step="2"
                value={selectedSticker.size || 60}
                onChange={(e) =>
                  onUpdateSticker({ ...selectedSticker, size: parseInt(e.target.value) })
                }
                className="w-full accent-pink-500 h-1.5 bg-[#222222] rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1 uppercase tracking-wider">
                  <RotateCw className="w-3 h-3 text-pink-400" />
                  Rotation
                </span>
                <span className="text-pink-400 font-mono">{selectedSticker.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedSticker.rotation || 0}
                onChange={(e) =>
                  onUpdateSticker({ ...selectedSticker, rotation: parseInt(e.target.value) })
                }
                className="w-full accent-pink-500 h-1.5 bg-[#222222] rounded-lg cursor-pointer"
              />
            </div>

            {/* Duplicate & Delete Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A2A]">
              <button
                onClick={() => onDuplicateSticker(selectedSticker)}
                className="flex-1 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDeleteSticker(selectedSticker.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* CASE 4: NO ITEM SELECTED -> SHOW QUICK ACTIONS, STICKERS, & BACKGROUND EDITOR */}
        {!selectedClip && !selectedText && !selectedSticker && (
          <div className="space-y-3.5">
            {/* Quick Actions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Studio Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenAudioModal}
                  className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#222222] border border-[#2A2A2A] hover:border-pink-500/40 text-left transition flex flex-col gap-1"
                >
                  <div className="flex items-center gap-1.5 text-pink-400 font-bold text-xs">
                    <Music className="w-3.5 h-3.5" />
                    Audio
                  </div>
                  <p className="text-[9px] text-slate-500">Track & beat</p>
                </button>

                <button
                  onClick={onOpenOverlayModal}
                  className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#222222] border border-[#2A2A2A] hover:border-amber-500/40 text-left transition flex flex-col gap-1"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Layers className="w-3.5 h-3.5" />
                    Overlay
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">
                    {globalOverlay !== 'none' ? globalOverlay : 'Grain / VHS'}
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
            </div>

            {/* Sticker / Emoji Section */}
            <div className="space-y-2 bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3 h-3 text-pink-400" />
                Stickers & Emojis
              </span>
              <p className="text-[10px] text-slate-500">Click to add sticker onto the reel canvas</p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onAddSticker(emoji)}
                    className="aspect-square flex items-center justify-center text-xl bg-[#1C1C1C] hover:bg-pink-500/20 hover:scale-110 border border-[#2A2A2A] hover:border-pink-500/40 rounded-lg transition"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Background Color & Gradient Editor */}
            <div className="space-y-2 bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3 h-3 text-pink-400" />
                Canvas Background
              </span>

              {/* Solid Color Picker */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-medium">Solid Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) =>
                      onUpdateBackground({ color: e.target.value, gradient: undefined })
                    }
                    className="w-7 h-7 rounded-lg border border-[#2A2A2A] bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    {backgroundColor}
                  </span>
                </div>
              </div>

              {/* Gradient Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Gradient Presets</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {GRADIENT_PRESETS.map((p) => {
                    const isSelected =
                      backgroundGradient &&
                      backgroundGradient.join(',') === p.colors.join(',');
                    return (
                      <button
                        key={p.name}
                        onClick={() =>
                          onUpdateBackground({ color: undefined, gradient: p.colors })
                        }
                        style={{
                          background: `linear-gradient(135deg, ${p.colors.join(', ')})`,
                        }}
                        className={`h-7 rounded-lg text-[9px] font-bold text-white shadow transition flex items-center justify-center px-1 border ${
                          isSelected ? 'border-white scale-105' : 'border-black/30 opacity-90 hover:opacity-100'
                        }`}
                        title={p.name}
                      >
                        <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset to Default */}
              <button
                onClick={() =>
                  onUpdateBackground({ color: '#0A0D14', gradient: undefined })
                }
                className="w-full py-1.5 text-[10px] font-semibold text-slate-400 hover:text-white bg-[#222222] hover:bg-[#2A2A2A] rounded-lg transition"
              >
                Reset to Black Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Inspector;
