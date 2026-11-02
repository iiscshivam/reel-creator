import React from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  Type,
  Smile,
  Layers,
  Sparkles,
} from 'lucide-react';

export type ToolType = 'upload' | 'photos' | 'videos' | 'audio' | 'text' | 'stickers' | 'overlays';

interface ToolRailProps {
  activeTool: ToolType | null;
  onToolChange: (tool: ToolType) => void;
}

const TOOLS: { id: ToolType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'photos', icon: ImageIcon, label: 'Photos' },
  { id: 'videos', icon: Video, label: 'Videos' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'stickers', icon: Smile, label: 'Stickers' },
  { id: 'overlays', icon: Layers, label: 'Overlays' },
];

export const ToolRail: React.FC<ToolRailProps> = ({ activeTool, onToolChange }) => {
  return (
    <aside
      className="w-14 h-full bg-[#141414] border-r border-[#2A2A2A] flex flex-col items-center py-3 gap-1 shrink-0 select-none z-20"
      aria-label="Editor Tools"
    >
      <div className="flex flex-col gap-1 w-full items-center">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1C1C1C]'
              }`}
              title={tool.label}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-pink-500 rounded-r" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate leading-none">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom accent divider & icon */}
      <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-[#2A2A2A] w-8">
        <div className="w-6 h-6 rounded-lg bg-[#1C1C1C] flex items-center justify-center text-slate-500" title="Pro Studio">
          <Sparkles className="w-3 h-3 text-pink-400" />
        </div>
      </div>
    </aside>
  );
};

export default ToolRail;
