import React, { useState, useRef } from 'react';
import { MediaClip, AudioTrack } from '../types';
import { SAMPLE_PHOTOS, SAMPLE_VIDEOS, createSynthAudioWav, generateCanvasPattern } from '../utils/sampleData';
import { Upload, Image as ImageIcon, Video, Music, Plus, Play, Pause, Sparkles } from 'lucide-react';

interface MediaLibraryProps {
  onAddClip: (clip: Omit<MediaClip, 'id'>) => void;
  onSetAudio: (audio: AudioTrack) => void;
  currentAudioId?: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onAddClip,
  onSetAudio,
  currentAudioId,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'photos' | 'videos' | 'audio'>('upload');
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
        });
      } else if (isVideo) {
        // Read video duration using temp video element
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
          });
        };
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview or stop audio track
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
    <div className="w-80 border-r border-slate-800 bg-[#0F141F] flex flex-col h-full shrink-0">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 p-2 gap-1 border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'upload'
              ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Upload className="w-4 h-4 mb-1" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'photos'
              ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ImageIcon className="w-4 h-4 mb-1" />
          Photos
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'videos'
              ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Video className="w-4 h-4 mb-1" />
          Videos
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'audio'
              ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Music className="w-4 h-4 mb-1" />
          Music
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* TAB 1: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/30 hover:bg-pink-500/5 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 group-hover:bg-pink-500/20 text-slate-400 group-hover:text-pink-400 flex items-center justify-center mb-3 transition">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-slate-200 mb-1">
                Drop your media here
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Supports MP4, WEBM, MOV, JPG, PNG, MP3
              </p>
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                Browse Files
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-pink-400">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Tips for Viral Reels
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>Ideal reel length is 7 to 15 seconds.</li>
                <li>Hook viewers with a text card in the first 2 seconds.</li>
                <li>Sync your photo transitions to the audio beat.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: STOCK PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Curated Presets
              </span>
              <button
                onClick={() => {
                  const patterns = ['sunset', 'cyberpunk', 'nature', 'urban', 'abstract'] as const;
                  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
                  const patternUrl = generateCanvasPattern(randomPattern);
                  onAddClip({
                    type: 'photo',
                    title: `Generated ${randomPattern.toUpperCase()}`,
                    src: patternUrl,
                    thumbnail: patternUrl,
                    duration: 3.0,
                    transition: 'zoom-in',
                    filter: 'normal',
                    fit: 'cover',
                  });
                }}
                className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
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
                        filter: photo.fallbackType === 'sunset' ? 'warm' : photo.fallbackType === 'cyberpunk' ? 'cyberpunk' : 'normal',
                        fit: 'cover',
                      });
                    }}
                    className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer hover:border-pink-500 transition shadow"
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
                      <p className="text-[11px] font-semibold text-white leading-tight">
                        {photo.title}
                      </p>
                      <span className="text-[9px] text-slate-300">Photo • 3s</span>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STOCK VIDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Free Stock Clips
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
                  className="group relative rounded-xl p-3 bg-slate-900/80 border border-slate-800 hover:border-pink-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-pink-400 transition">
                        {v.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">HD Video Loop • {v.duration}s</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-pink-500 group-hover:text-white transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIO & SOUNDTRACK */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Soundtrack & Beats
              </span>
              <label className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload MP3
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="space-y-2">
              {[
                { id: 'synth-upbeat', title: 'Upbeat Electro Beat', genre: 'Electronic / Dance', type: 'upbeat' as const },
                { id: 'synth-lofi', title: 'Chilled Lo-Fi Sunset', genre: 'Lo-Fi / Hip-Hop', type: 'lofi' as const },
                { id: 'synth-cinematic', title: 'Cinematic Ambient Flow', genre: 'Cinematic / Drone', type: 'cinematic' as const },
              ].map((item) => {
                const isSelected = currentAudioId === item.id;
                const isPlaying = playingAudioId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-pink-500/10 border-pink-500/60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const trackSrc = createSynthAudioWav(item.type, 15);
                            toggleAudioPreview(item.id, trackSrc);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                            isPlaying
                              ? 'bg-pink-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.genre} • 15s</div>
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
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-pink-500 text-white'
                            : 'bg-slate-800 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
