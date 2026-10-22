import React from 'react';
import { OverlayEffect } from '../types';
import { Layers, X, Check, Sparkles, Film, Video, Sun, EyeOff } from 'lucide-react';

interface OverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOverlay: OverlayEffect;
  onSelectOverlay: (overlay: OverlayEffect) => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({
  isOpen,
  onClose,
  currentOverlay,
  onSelectOverlay,
}) => {
  if (!isOpen) return null;

  const OVERLAYS: { id: OverlayEffect; title: string; subtitle: string; icon: any; previewBg: string }[] = [
    {
      id: 'none',
      title: 'Clean / No Overlay',
      subtitle: 'Original pristine digital video without effects',
      icon: EyeOff,
      previewBg: 'from-slate-800 to-slate-900',
    },
    {
      id: 'light-leak',
      title: 'Golden Light Leak',
      subtitle: 'Warm cinematic sunset lens flare in the upper corner',
      icon: Sun,
      previewBg: 'from-amber-500/20 via-pink-500/20 to-purple-900/40',
    },
    {
      id: 'grain',
      title: '35mm Film Grain',
      subtitle: 'VSCO-style nostalgic analog photographic texture',
      icon: Film,
      previewBg: 'from-zinc-700/30 to-zinc-900/50',
    },
    {
      id: 'vhs',
      title: 'Retro VHS 2026',
      subtitle: 'CRT scanlines, green PLAY timecode, and red REC stamp',
      icon: Video,
      previewBg: 'from-emerald-950/40 via-black to-red-950/30',
    },
    {
      id: 'viewfinder',
      title: '4K Camera Viewfinder',
      subtitle: 'Professional framing corners, crosshair & 60FPS ISO HUD',
      icon: Sparkles,
      previewBg: 'from-cyan-950/40 via-slate-900 to-blue-950/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0F141F] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Choose Visual Overlay</h2>
              <p className="text-xs text-slate-400">Add cinematic lighting, analog grain, or retro camera effects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {OVERLAYS.map((item) => {
            const isSelected = currentOverlay === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectOverlay(item.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-pink-500/15 border-pink-500 shadow-lg shadow-pink-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.previewBg} border border-slate-700/60 flex items-center justify-center text-white shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-pink-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.title}
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-pink-500 text-white text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">{item.subtitle}</p>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-slate-700 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
