import React, { useState, useRef } from 'react';
import { MediaClip, AudioTrack, TextAnimation } from '../types';
import { SAMPLE_PHOTOS, SAMPLE_VIDEOS, VIRAL_CAPTION_HOOKS, createSynthAudioWav, generateCanvasPattern } from '../utils/sampleData';
import { Upload, Image as ImageIcon, Video, Music, Plus, Play, Pause, Sparkles, MessageSquare, ChevronLeft, ChevronRight, Folder, Smile } from 'lucide-react';

interface MediaLibraryProps {
  onAddClip: (clip: Omit<MediaClip, 'id'>) => void;
  onSetAudio: (audio: AudioTrack) => void;
  onAddCaption?: (text: string, animation: TextAnimation) => void;
  onAddSticker?: (emoji: string) => void;
  currentAudioId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onAddClip,
  onSetAudio,
  onAddCaption,
  onAddSticker,
  currentAudioId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'photos' | 'videos' | 'audio' | 'captions' | 'stickers'>('upload');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle local user file upload
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

  // COLLAPSED ICON RAIL
  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r border-slate-800 bg-[#0F141F] flex flex-col items-center py-2 shrink-0 select-none z-20">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-400 mb-4 transition"
          title="Expand Media Library"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setActiveTab('upload');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Upload Files"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('photos');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stock Photos"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('videos');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stock Videos"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('audio');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Music / Audio"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('captions');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Viral Hooks"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('stickers');
              onToggleCollapse();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Emoji Stickers"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED MEDIA LIBRARY
  return (
    <div className="w-72 h-full border-r border-slate-800 bg-[#0F141F] flex flex-col shrink-0 select-none z-20 overflow-hidden">
      {/* Media Library Header with Integrated Collapse Button */}
      <div className="h-8 px-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Media Library
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-pink-400 hover:bg-slate-800 transition flex items-center gap-0.5 text-[10px]"
          title="Collapse Media Library"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-6 p-1 gap-0.5 border-b border-slate-800 bg-slate-900/40 shrink-0">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'upload'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3 h-3 mb-0.5" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'photos'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3 h-3 mb-0.5" />
          Photos
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'videos'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3 h-3 mb-0.5" />
          Videos
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'audio'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3 h-3 mb-0.5" />
          Music
        </button>
        <button
          onClick={() => setActiveTab('captions')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'captions'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3 h-3 mb-0.5" />
          Hooks
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex flex-col items-center py-1.5 px-0.5 rounded text-[9px] font-bold transition ${
            activeTab === 'stickers'
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smile className="w-3 h-3 mb-0.5" />
          Stickers
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-2.5 scrollbar-thin">
        {/* TAB 1: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-900/30 hover:bg-pink-500/5 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-9 h-9 mx-auto rounded-full bg-slate-800 group-hover:bg-pink-500/20 text-slate-400 group-hover:text-pink-400 flex items-center justify-center mb-2 transition">
                <Upload className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-slate-200 mb-0.5">
                Drop your media here
              </h3>
              <p className="text-[10px] text-slate-400 mb-2">
                MP4, WEBM, MOV, JPG, PNG, MP3
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                Browse Files
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-pink-400">
                <Sparkles className="w-3 h-3" />
                Tips
              </div>
              <p className="text-slate-400">
                Uploaded clips are added directly to the timeline.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Stock Presets
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
                className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                New Gen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
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
                        filter: photo.fallbackType === 'sunset' ? 'warm' : photo.fallbackType === 'cyberpunk' ? 'cyberpunk' : 'normal',
                        fit: 'cover',
                        motion: i % 2 === 0 ? 'zoom-in' : 'zoom-out',
                      });
                    }}
                    className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer hover:border-pink-500 transition shadow"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackUrl;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5 opacity-90 group-hover:opacity-100">
                      <p className="text-[10px] font-semibold text-white leading-tight truncate">
                        {photo.title}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-1.5">
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
                className="group rounded-lg p-2 bg-slate-900 border border-slate-800 hover:border-pink-500 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-pink-400 truncate max-w-[150px]">
                      {v.title}
                    </h4>
                    <p className="text-[9px] text-slate-400">{v.duration}s Video Loop</p>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400" />
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AUDIO */}
        {activeTab === 'audio' && (
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
                  className={`p-2 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-pink-500/10 border-pink-500/60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => {
                        const trackSrc = createSynthAudioWav(item.type, 15);
                        toggleAudioPreview(item.id, trackSrc);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isPlaying ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                    </button>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-white truncate">{item.title}</div>
                      <div className="text-[9px] text-slate-400">{item.bpm} BPM</div>
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isSelected ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: HOOKS */}
        {activeTab === 'captions' && (
          <div className="space-y-1.5">
            {VIRAL_CAPTION_HOOKS.map((hook, i) => (
              <div
                key={i}
                onClick={() => {
                  if (onAddCaption) onAddCaption(hook.text, hook.animation);
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500 cursor-pointer transition flex items-center justify-between"
              >
                <p className="text-[11px] font-bold text-slate-200 hover:text-pink-400 truncate">
                  {hook.text}
                </p>
                <Plus className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: STICKERS */}
        {activeTab === 'stickers' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Emoji Stickers
            </span>
            <p className="text-[9px] text-slate-500">
              Click an emoji to add it as a sticker onto your reel.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {['🔥', '❤️', '✨', '💯', '🎵', '🌟', '💥', '🎉', '👀', '💫', '⚡', '🚀', '😍', '👏', '👑', '🌈'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onAddSticker?.(emoji)}
                  className="aspect-square flex items-center justify-center text-2xl bg-slate-900 border border-slate-800 hover:border-pink-500 hover:scale-115 rounded-xl transition shadow"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
