import React from 'react';
import { AspectRatio, OverlayEffect } from '../types';
import { Film, Download, Type, Sparkles, Smartphone, Square, Monitor, Zap, Layers, Music, Undo2, Redo2 } from 'lucide-react';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onAddText: () => void;
  onExport: () => void;
  onLoadTemplate: (templateName: string) => void;
  onAutoSyncBeat: () => void;
  onOpenAudioModal: () => void;
  onOpenOverlayModal: () => void;
  globalOverlay?: OverlayEffect;
  totalDuration: number;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onAspectRatioChange,
  onAddText,
  onExport,
  onLoadTemplate,
  onAutoSyncBeat,
  onOpenAudioModal,
  onOpenOverlayModal,
  globalOverlay = 'none',
  totalDuration,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/25">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Reel Creator
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
              Pro Studio
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {totalDuration.toFixed(1)}s Reel • Centered Phone Preview
          </p>
        </div>
      </div>

      {/* Center Controls: Aspect Ratio, Audio, Overlay, Beat Sync */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => onAspectRatioChange('9:16')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '9:16'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="9:16 Vertical Reel"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">9:16 Reel</span>
          </button>

          <button
            onClick={() => onAspectRatioChange('1:1')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '1:1'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="1:1 Square Feed"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">1:1 Square</span>
          </button>

          <button
            onClick={() => onAspectRatioChange('16:9')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '16:9'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="16:9 Landscape"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">16:9 Wide</span>
          </button>
        </div>

        {/* Option to Add Audio */}
        <button
          onClick={onOpenAudioModal}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-pink-300 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
          title="Add or change background music / soundtrack"
        >
          <Music className="w-3.5 h-3.5 text-pink-400" />
          <span>Add Audio</span>
        </button>

        {/* Option to Add Overlay */}
        <button
          onClick={onOpenOverlayModal}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
          title="Add or change visual overlay (35mm Grain, Retro VHS, Light Leak, Viewfinder)"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Add Overlay</span>
          {globalOverlay !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>

        {/* One-Click Auto Beat-Sync */}
        <button
          onClick={onAutoSyncBeat}
          className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 items-center gap-1.5 transition shadow-sm active:scale-95"
          title="Auto-sync photos to music beat"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="hidden lg:inline">Beat Sync</span>
        </button>

        {/* Viral Templates */}
        <div className="hidden xl:flex items-center gap-1.5">
          <button
            onClick={() => onLoadTemplate('photodump')}
            className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-pink-500/40 hover:text-pink-300 transition"
          >
            <Sparkles className="w-3 h-3 text-pink-400 inline mr-1" />
            Photo Dump
          </button>
          <button
            onClick={() => onLoadTemplate('filmvlog')}
            className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400 inline mr-1" />
            35mm Vlog
          </button>
        </div>
      </div>

      {/* Right Actions: Undo/Redo, Add Text, Export, GitHub */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onAddText}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Type className="w-4 h-4 text-pink-400" />
          <span className="hidden sm:inline">Add Text</span>
        </button>

        <button
          onClick={onExport}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 shadow-lg shadow-pink-500/25 flex items-center gap-1.5 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Reel</span>
        </button>

        <a
          href="https://github.com/iiscshivam/reel-creator"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="View on GitHub"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
