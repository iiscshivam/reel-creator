import React from 'react';
import { MediaClip, TextOverlay, FilterType, TransitionType, TextAnimation, MotionEffect, OverlayEffect } from '../types';
import { Sliders, Sparkles, Wand2, Trash2, Copy, MoveHorizontal, Palette, Info, Eye, Layers } from 'lucide-react';

interface InspectorPanelProps {
  selectedClip: MediaClip | null;
  selectedText: TextOverlay | null;
  onUpdateClip: (clip: MediaClip) => void;
  onUpdateText: (text: TextOverlay) => void;
  onDuplicateClip: (clip: MediaClip) => void;
  onDeleteClip: (id: string) => void;
  onDeleteText: (id: string) => void;
  globalOverlay?: OverlayEffect;
  onChangeOverlay?: (overlay: OverlayEffect) => void;
  totalDuration: number;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedClip,
  selectedText,
  onUpdateClip,
  onUpdateText,
  onDuplicateClip,
  onDeleteClip,
  onDeleteText,
  globalOverlay = 'none',
  onChangeOverlay,
  totalDuration,
}) => {
  const FILTERS: { id: FilterType; label: string; desc: string }[] = [
    { id: 'normal', label: 'Original', desc: 'No color filter' },
    { id: 'vibrant', label: 'Vibrant Pop', desc: 'Punchy saturated colors' },
    { id: 'vintage', label: '90s Vintage', desc: 'Retro warm sepia tone' },
    { id: 'noir', label: 'Classic Noir', desc: 'High contrast B&W' },
    { id: 'warm', label: 'Golden Hour', desc: 'Warm sunset glow' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Futuristic neon tint' },
    { id: 'dramatic', label: 'Cinematic', desc: 'Moody film curve' },
  ];

  const TRANSITIONS: { id: TransitionType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'crossfade', label: 'Crossfade' },
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'slide-left', label: 'Slide Left' },
    { id: 'fade-black', label: 'Fade to Black' },
    { id: 'flash', label: 'Flash' },
  ];

  const MOTIONS: { id: MotionEffect; label: string }[] = [
    { id: 'zoom-in', label: 'Slow Zoom In' },
    { id: 'zoom-out', label: 'Slow Zoom Out' },
    { id: 'pan-right', label: 'Pan Right' },
    { id: 'none', label: 'Static' },
  ];

  const FONTS = [
    { id: 'Outfit', label: 'Outfit (Modern)' },
    { id: 'Inter', label: 'Inter (Clean)' },
    { id: 'Bebas Neue', label: 'Bebas Neue (Bold)' },
    { id: 'Playfair Display', label: 'Playfair (Aesthetic)' },
  ];

  const ANIMATIONS: { id: TextAnimation; label: string }[] = [
    { id: 'pop', label: 'Pop Bounce' },
    { id: 'slide-up', label: 'Slide Up' },
    { id: 'fade', label: 'Smooth Fade' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'none', label: 'None' },
  ];

  return (
    <div className="w-80 border-l border-slate-800 bg-[#0F141F] flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-pink-400" />
          Inspector
        </h2>
        <span className="text-[11px] text-slate-500">
          {selectedClip ? 'Clip Properties' : selectedText ? 'Text Properties' : 'Project Settings'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* CASE 1: CLIP SELECTED */}
        {selectedClip && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Active Clip
              </span>
              <h3 className="text-sm font-bold text-white truncate">{selectedClip.title}</h3>
              <p className="text-xs text-slate-400 capitalize">{selectedClip.type} Clip</p>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Duration</span>
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

            {/* Ken Burns Motion Effect (for photos) */}
            {selectedClip.type === 'photo' && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  Ken Burns Motion
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateClip({ ...selectedClip, motion: m.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
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

            {/* Fit mode */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Aspect Fit Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateClip({ ...selectedClip, fit: 'cover' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    selectedClip.fit === 'cover'
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Cover (Full)
                </button>
                <button
                  onClick={() => onUpdateClip({ ...selectedClip, fit: 'contain' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    selectedClip.fit === 'contain'
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Contain (Letterbox)
                </button>
              </div>
            </div>

            {/* Transition Effect to Next Clip */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />
                Transition to Next Clip
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TRANSITIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateClip({ ...selectedClip, transition: t.id })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                      selectedClip.transition === t.id
                        ? 'bg-pink-500 text-white border-pink-500 shadow'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filters */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Cinematic Color Grade
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateClip({ ...selectedClip, filter: f.id })}
                    className={`py-1.5 px-2.5 rounded-lg text-left border transition flex items-center justify-between ${
                      selectedClip.filter === f.id
                        ? 'bg-pink-500/15 border-pink-500 text-pink-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-semibold">{f.label}</span>
                    <span className="text-[10px] text-slate-500">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => onDuplicateClip(selectedClip)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: TEXT OVERLAY SELECTED */}
        {selectedText && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Text Layer
              </span>
              <h3 className="text-sm font-bold text-white">Edit Caption</h3>
            </div>

            {/* Textarea Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Text</label>
              <textarea
                value={selectedText.text}
                onChange={(e) => onUpdateText({ ...selectedText, text: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-semibold"
                placeholder="Enter caption..."
              />
            </div>

            {/* Typography & Font */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Font Family</label>
              <div className="grid grid-cols-2 gap-1.5">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => onUpdateText({ ...selectedText, fontFamily: font.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs border transition ${
                      selectedText.fontFamily === font.id
                        ? 'bg-pink-500 text-white border-pink-500 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Font Size</span>
                <span className="text-pink-400 font-mono font-bold">
                  {selectedText.fontSize}px
                </span>
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

            {/* Text Color & Background Pill */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Style & Backdrop</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Text Color</span>
                  <div className="flex items-center gap-1.5">
                    {['#FFFFFF', '#F43F5E', '#38BDF8', '#FBBF24', '#10B981'].map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateText({ ...selectedText, color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          selectedText.color === c ? 'border-pink-500 scale-110' : 'border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Pill Box</span>
                  <select
                    value={selectedText.backgroundColor}
                    onChange={(e) =>
                      onUpdateText({ ...selectedText, backgroundColor: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 text-xs text-white"
                  >
                    <option value="rgba(0, 0, 0, 0.7)">Black Glass</option>
                    <option value="rgba(255, 255, 255, 0.95)">Solid White</option>
                    <option value="rgba(236, 72, 153, 0.85)">Neon Pink</option>
                    <option value="rgba(15, 23, 42, 0.9)">Dark Slate</option>
                    <option value="transparent">None (Transparent)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Animation */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Intro Animation
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ANIMATIONS.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => onUpdateText({ ...selectedText, animation: anim.id })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                      selectedText.animation === anim.id
                        ? 'bg-pink-500 text-white border-pink-500 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Start Time</span>
                  <span className="text-pink-400 font-mono font-bold">
                    {selectedText.startTime.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(1, totalDuration - 1)}
                  step="0.2"
                  value={selectedText.startTime}
                  onChange={(e) =>
                    onUpdateText({ ...selectedText, startTime: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Duration</span>
                  <span className="text-pink-400 font-mono font-bold">
                    {selectedText.duration.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={selectedText.duration}
                  onChange={(e) =>
                    onUpdateText({ ...selectedText, duration: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Delete button */}
            <div className="pt-2">
              <button
                onClick={() => onDeleteText(selectedText.id)}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Text Layer
              </button>
            </div>
          </div>
        )}

        {/* CASE 3: NO SELECTION (PROJECT SETTINGS) */}
        {!selectedClip && !selectedText && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                  Reel Creator Studio
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add photos, videos, and music. Use the top bar to auto-sync clips to the audio beat, or customize individual clips below.
              </p>
            </div>

            {/* Global Aesthetic Overlay */}
            {onChangeOverlay && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  Film & Aesthetic Overlay
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'none' as OverlayEffect, label: 'Clean (No Overlay)', desc: 'Pure digital footage' },
                    { id: 'light-leak' as OverlayEffect, label: 'Golden Light Leak', desc: 'Warm cinematic bokeh' },
                    { id: 'grain' as OverlayEffect, label: '35mm Film Grain', desc: 'VSCO-style analog texture' },
                    { id: 'vhs' as OverlayEffect, label: 'Retro VHS 2026', desc: 'Scanlines & retro date stamp' },
                    { id: 'viewfinder' as OverlayEffect, label: '4K Camera Viewfinder', desc: 'Professional camera HUD' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onChangeOverlay(item.id)}
                      className={`py-2 px-3 rounded-xl text-left border transition flex items-center justify-between ${
                        globalOverlay === item.id
                          ? 'bg-pink-500/15 border-pink-500 text-pink-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Key Shortcuts
              </span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Play / Pause</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-pink-400 border border-slate-700">
                    Space
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auto Beat Sync</span>
                  <span className="text-amber-400 font-semibold">Click ⚡ Beat Sync</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Add Text Hooks</span>
                  <span className="text-slate-300 font-medium">Use "Hooks" tab on left</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
