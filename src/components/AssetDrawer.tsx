import React, { useRef, useState } from 'react';
import { MediaClip, AudioTrack, TextAnimation } from '../types';
import { ToolType } from './ToolRail';
import {
  SAMPLE_PHOTOS,
  SAMPLE_VIDEOS,
  VIRAL_CAPTION_HOOKS,
  createSynthAudioWav,
  generateCanvasPattern,
} from '../utils/sampleData';
import {
  X,
  Upload,
  Sparkles,
  Plus,
  Play,
  Pause,
  Video,
  Music,
  Smile,
  Layers,
  Type,
  FolderOpen,
} from 'lucide-react';

interface AssetDrawerProps {
  activeTool: ToolType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddClip: (clip: Omit<MediaClip, 'id'>) => void;
  onSetAudio: (audio: AudioTrack) => void;
  onAddCaption: (text: string, animation: TextAnimation) => void;
  onAddSticker: (emoji: string) => void;
  onOpenOverlayModal: () => void;
  onOpenAudioModal: () => void;
  currentAudioId?: string;
}

const TOOL_TITLES: Record<ToolType, string> = {
  upload: 'Upload Media',
  photos: 'Stock Photos',
  videos: 'Stock Videos',
  audio: 'Music & Audio',
  text: 'Text & Captions',
  stickers: 'Stickers & Emojis',
  overlays: 'Visual Overlays',
};

const EMOJI_LIST = ['🔥', '❤️', '✨', '💯', '🎵', '🌟', '💥', '🎉', '👀', '💫', '⚡', '🚀', '😍', '👏', '👑', '🌈'];

export const AssetDrawer: React.FC<AssetDrawerProps> = ({
  activeTool,
  isOpen,
  onClose,
  onAddClip,
  onSetAudio,
  onAddCaption,
  onAddSticker,
  onOpenOverlayModal,
  onOpenAudioModal,
  currentAudioId,
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !activeTool) {
    return <div className="w-0 overflow-hidden shrink-0 transition-all duration-200" />;
  }

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');

      if (isImage) {
        onAddClip({
          type: 'photo',
          title: file.name.replace(/\.[^/.]+$/, ''),
          src: objectUrl,
          thumbnail: objectUrl,
          duration: 3.0,
          transition: 'crossfade',
          filter: 'normal',
          fit: 'cover',
          motion: 'zoom-in',
        });
      } else if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.src = objectUrl;
        tempVideo.onloadedmetadata = () => {
          const dur = Math.min(tempVideo.duration || 5, 10);
          onAddClip({
            type: 'video',
            title: file.name.replace(/\.[^/.]+$/, ''),
            src: objectUrl,
            thumbnail: objectUrl,
            duration: Math.max(2, parseFloat(dur.toFixed(1))),
            transition: 'crossfade',
            filter: 'normal',
            fit: 'cover',
            volume: 1,
            speed: 1,
          });
        };
      } else if (isAudio) {
        const tempAudio = document.createElement('audio');
        tempAudio.src = objectUrl;
        tempAudio.onloadedmetadata = () => {
          onSetAudio({
            id: 'custom-' + Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            src: objectUrl,
            duration: tempAudio.duration || 15,
            volume: 0.8,
            genre: 'Custom Audio',
            bpm: 120,
          });
        };
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAudioPreview = (id: string, src: string) => {
    if (playingAudioId === id) {
      audioPreviewRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio();
      }
      audioPreviewRef.current.src = src;
      audioPreviewRef.current.play().catch(console.warn);
      audioPreviewRef.current.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="w-[280px] h-full bg-[#1C1C1C] border-r border-[#2A2A2A] flex flex-col overflow-hidden shrink-0 select-none z-10 transition-all duration-200">
      {/* Header: Tool name + close (X) button */}
      <div className="h-10 px-3 border-b border-[#2A2A2A] bg-[#181818] flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-white tracking-wide">
          {TOOL_TITLES[activeTool]}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#222222] transition"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3 text-xs">
        {/* TOOL 1: UPLOAD */}
        {activeTool === 'upload' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2A2A2A] hover:border-pink-500/60 rounded-xl p-5 text-center cursor-pointer bg-[#141414] hover:bg-pink-500/5 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-10 h-10 mx-auto rounded-full bg-[#222222] group-hover:bg-pink-500/20 text-slate-400 group-hover:text-pink-400 flex items-center justify-center mb-2.5 transition">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-xs text-slate-200 mb-1">
                Drop your media here
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">
                MP4, WEBM, MOV, JPG, PNG, MP3
              </p>
              <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[#222222] hover:bg-[#2A2A2A] text-slate-200 border border-[#2A2A2A]">
                Browse Files
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141414] border border-[#2A2A2A] text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-pink-400">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Tip
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Uploaded photos and videos are automatically added to the timeline at the end of the reel.
              </p>
            </div>
          </div>
        )}

        {/* TOOL 2: PHOTOS */}
        {activeTool === 'photos' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Curated Presets
              </span>
              <button
                onClick={() => {
                  const patterns = ['sunset', 'cyberpunk', 'nature', 'urban', 'abstract', 'minimal'] as const;
                  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
                  const patternUrl = generateCanvasPattern(randomPattern);
                  onAddClip({
                    type: 'photo',
                    title: `Gen ${randomPattern.toUpperCase()}`,
                    src: patternUrl,
                    thumbnail: patternUrl,
                    duration: 3.0,
                    transition: 'zoom-in',
                    filter: 'normal',
                    fit: 'cover',
                    motion: 'zoom-in',
                  });
                }}
                className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 bg-[#222222] px-2 py-1 rounded-md border border-[#2A2A2A]"
              >
                <Sparkles className="w-3 h-3" />
                Generate New
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PHOTOS.map((photo, i) => {
                const fallbackUrl = generateCanvasPattern(photo.fallbackType);
                return (
                  <div
                    key={i}
                    onClick={() => {
                      onAddClip({
                        type: 'photo',
                        title: photo.title,
                        src: photo.url || fallbackUrl,
                        thumbnail: photo.url || fallbackUrl,
                        duration: 3.0,
                        transition: 'crossfade',
                        filter:
                          photo.fallbackType === 'sunset'
                            ? 'warm'
                            : photo.fallbackType === 'cyberpunk'
                            ? 'cyberpunk'
                            : 'normal',
                        fit: 'cover',
                        motion: i % 2 === 0 ? 'zoom-in' : 'zoom-out',
                      });
                    }}
                    className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#141414] border border-[#2A2A2A] cursor-pointer hover:border-pink-500 transition shadow"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackUrl;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-90 group-hover:opacity-100">
                      <p className="text-[10px] font-semibold text-white leading-tight truncate">
                        {photo.title}
                      </p>
                    </div>
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOOL 3: VIDEOS */}
        {activeTool === 'videos' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Stock Video Loops
            </span>
            <div className="space-y-2">
              {SAMPLE_VIDEOS.map((v, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddClip({
                      type: 'video',
                      title: v.title,
                      src: v.url,
                      thumbnail: v.url,
                      duration: v.duration,
                      transition: 'crossfade',
                      filter: 'normal',
                      fit: 'cover',
                      volume: 1,
                      speed: 1,
                    });
                  }}
                  className="group rounded-xl p-2.5 bg-[#141414] border border-[#2A2A2A] hover:border-pink-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-pink-400 truncate max-w-[150px]">
                        {v.title}
                      </h4>
                      <p className="text-[9px] text-slate-500">{v.duration}s Video Loop</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-[#222222] group-hover:bg-pink-500 group-hover:text-white text-slate-400 flex items-center justify-center transition">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 4: AUDIO */}
        {activeTool === 'audio' && (
          <div className="space-y-3">
            <button
              onClick={onOpenAudioModal}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 hover:border-pink-500 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Music className="w-3.5 h-3.5 text-pink-400" />
              Open Full Audio Library / Upload
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Royalty-Free Beats
            </span>

            <div className="space-y-2">
              {[
                { id: 'synth-upbeat', title: 'Upbeat Electro Beat', bpm: 128, genre: 'Electronic', type: 'upbeat' as const },
                { id: 'synth-lofi', title: 'Chilled Lo-Fi Sunset', bpm: 84, genre: 'Lo-Fi', type: 'lofi' as const },
                { id: 'synth-cinematic', title: 'Cinematic Flow', bpm: 70, genre: 'Cinematic', type: 'cinematic' as const },
              ].map((item) => {
                const isSelected = currentAudioId === item.id;
                const isPlaying = playingAudioId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500/60'
                        : 'bg-[#141414] border-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <button
                        onClick={() => {
                          const trackSrc = createSynthAudioWav(item.type, 15);
                          toggleAudioPreview(item.id, trackSrc);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isPlaying ? 'bg-pink-500 text-white' : 'bg-[#222222] text-slate-300 hover:text-white'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-white truncate">{item.title}</div>
                        <div className="text-[9px] text-slate-400">{item.bpm} BPM • {item.genre}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const trackSrc = createSynthAudioWav(item.type, 15);
                        onSetAudio({
                          id: item.id,
                          title: item.title,
                          src: trackSrc,
                          duration: 15,
                          volume: 0.8,
                          genre: item.genre,
                          bpm: item.bpm,
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition ${
                        isSelected ? 'bg-pink-500 text-white' : 'bg-[#222222] hover:bg-pink-500 hover:text-white text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOOL 5: TEXT */}
        {activeTool === 'text' && (
          <div className="space-y-3">
            <button
              onClick={() => onAddCaption('ADD CAPTION ✨', 'pop')}
              className="w-full py-2.5 px-3 rounded-xl bg-pink-500/20 border border-pink-500/40 hover:bg-pink-500 text-pink-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Type className="w-4 h-4" />
              + Add Heading / Caption
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Viral Hooks & Captions
            </span>

            <div className="space-y-1.5">
              {VIRAL_CAPTION_HOOKS.map((hook, i) => (
                <div
                  key={i}
                  onClick={() => onAddCaption(hook.text, hook.animation)}
                  className="p-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] hover:border-pink-500 cursor-pointer transition flex items-center justify-between group"
                >
                  <p className="text-[11px] font-bold text-slate-200 group-hover:text-pink-400 truncate">
                    {hook.text}
                  </p>
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 6: STICKERS */}
        {activeTool === 'stickers' && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Emoji Stickers
            </span>
            <p className="text-[10px] text-slate-400">
              Tap an emoji to place it directly onto the reel canvas.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onAddSticker(emoji)}
                  className="aspect-square flex items-center justify-center text-2xl bg-[#141414] border border-[#2A2A2A] hover:border-pink-500 hover:scale-110 rounded-xl transition shadow"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 7: OVERLAYS */}
        {activeTool === 'overlays' && (
          <div className="space-y-3">
            <button
              onClick={onOpenOverlayModal}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              Open Overlay Selector
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Available Visual Overlays
            </span>

            <div className="space-y-2">
              {[
                { name: 'Clean / No Overlay', desc: 'Pristine raw digital video' },
                { name: 'Golden Light Leak', desc: 'Sunset anamorphic flare' },
                { name: '35mm Film Grain', desc: 'Nostalgic analog film texture' },
                { name: 'Retro VHS 2026', desc: 'Scanlines, timecode & REC stamp' },
                { name: '4K Viewfinder', desc: 'Camera brackets & ISO HUD' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={onOpenOverlayModal}
                  className="p-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] hover:border-amber-500/60 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-[11px] font-bold text-white group-hover:text-amber-300">
                      {item.name}
                    </h4>
                    <p className="text-[9px] text-slate-500">{item.desc}</p>
                  </div>
                  <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDrawer;
