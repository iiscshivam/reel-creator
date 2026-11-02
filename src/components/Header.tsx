import React from 'react';
import { AspectRatio } from '../types';
import { Film, Download, Smartphone, Square, Monitor, Undo2, Redo2 } from 'lucide-react';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  totalDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onAspectRatioChange,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  totalDuration,
}) => {
  return (
    <header className="h-12 border-b border-[#2A2A2A] bg-[#141414] px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Logo + Title + Pro Studio badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-sm tracking-tight text-white">
            Reel Creator
          </h1>
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
            Pro Studio
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline ml-1">
            ({totalDuration.toFixed(1)}s)
          </span>
        </div>
      </div>

      {/* Center: Undo / Redo & Aspect Ratio switchers */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-0.5 shadow-inner">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-[#222222]'
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
                ? 'text-slate-300 hover:text-white hover:bg-[#222222]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Aspect Ratio Pills */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-0.5 flex items-center gap-0.5">
          <button
            onClick={() => onAspectRatioChange('9:16')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '9:16'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#222222]'
            }`}
            title="9:16 Vertical Reel"
          >
            <Smartphone className="w-3 h-3" />
            <span>9:16</span>
          </button>

          <button
            onClick={() => onAspectRatioChange('1:1')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '1:1'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#222222]'
            }`}
            title="1:1 Square Feed"
          >
            <Square className="w-3 h-3" />
            <span>1:1</span>
          </button>

          <button
            onClick={() => onAspectRatioChange('16:9')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              aspectRatio === '16:9'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#222222]'
            }`}
            title="16:9 Landscape"
          >
            <Monitor className="w-3 h-3" />
            <span>16:9</span>
          </button>
        </div>
      </div>

      {/* Right: Export Reel button & GitHub link */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 shadow-md shadow-pink-500/25 flex items-center gap-1.5 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Reel</span>
        </button>

        <a
          href="https://github.com/iiscshivam/reel-creator"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1C1C1C] transition"
          title="View on GitHub"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
