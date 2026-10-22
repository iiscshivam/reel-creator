import React, { useRef, useState } from 'react';
import { AudioTrack } from '../types';
import { createSynthAudioWav } from '../utils/sampleData';
import { Music, Upload, Play, Pause, Volume2, X, Check, Trash2 } from 'lucide-react';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudio: AudioTrack | null;
  onSelectAudio: (audio: AudioTrack) => void;
  onRemoveAudio: () => void;
  onUpdateVolume: (volume: number) => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({
  isOpen,
  onClose,
  currentAudio,
  onSelectAudio,
  onRemoveAudio,
  onUpdateVolume,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const togglePreview = (id: string, src: string) => {
    if (playingId === id) {
      audioPreviewRef.current?.pause();
      setPlayingId(null);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio();
      }
      audioPreviewRef.current.src = src;
      audioPreviewRef.current.play().catch(console.warn);
      audioPreviewRef.current.onended = () => setPlayingId(null);
      setPlayingId(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      onSelectAudio({
        id: 'uploaded-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        src: objectUrl,
        duration: tempAudio.duration || 15,
        volume: 0.8,
        genre: 'Uploaded Audio',
        bpm: 120,
      });
      onClose();
    };
  };

  const PRESET_TRACKS = [
    { id: 'synth-upbeat', title: 'Upbeat Electro Beat', bpm: 128, genre: 'Electronic / Dance', type: 'upbeat' as const, desc: 'High energy, punchy kick & bass' },
    { id: 'synth-lofi', title: 'Chilled Lo-Fi Sunset', bpm: 84, genre: 'Lo-Fi / Chillhop', type: 'lofi' as const, desc: 'Warm vinyl crackle & mellow Rhodes chords' },
    { id: 'synth-cinematic', title: 'Cinematic Ambient Flow', bpm: 70, genre: 'Cinematic / Drone', type: 'cinematic' as const, desc: 'Atmospheric sub bass & shimmer swell' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0F141F] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Soundtrack / Audio</h2>
              <p className="text-xs text-slate-400">Choose a royalty-free beat or upload custom music</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioPreviewRef.current?.pause();
              setPlayingId(null);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Upload Custom Audio Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-900/40 hover:bg-pink-500/5 transition group flex items-center justify-between px-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-pink-500/20 text-slate-300 group-hover:text-pink-400 flex items-center justify-center transition">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-pink-300">Upload Your Own Audio</div>
                <div className="text-[11px] text-slate-400">MP3, WAV, AAC, M4A from your device</div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 group-hover:bg-pink-500 group-hover:text-white text-slate-200 transition">
              Browse
            </span>
          </div>

          {/* Current Active Track & Volume */}
          {currentAudio && (
            <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span className="text-xs font-bold text-pink-300 truncate max-w-[240px]">
                    Active: {currentAudio.title}
                  </span>
                </div>
                <button
                  onClick={onRemoveAudio}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl">
                <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentAudio.volume}
                  onChange={(e) => onUpdateVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300 w-9 text-right">
                  {Math.round(currentAudio.volume * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Preset Beat Tracks */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Royalty-Free Beats & Soundtracks
            </span>
            <div className="space-y-2">
              {PRESET_TRACKS.map((track) => {
                const isSelected = currentAudio?.title.includes(track.title);
                const isPlaying = playingId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500/60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const src = createSynthAudioWav(track.type, 15);
                          togglePreview(track.id, src);
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                          isPlaying
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {track.title}
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-pink-400 font-mono text-[10px]">
                            {track.bpm} BPM
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{track.desc}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const src = createSynthAudioWav(track.type, 15);
                        onSelectAudio({
                          id: track.id,
                          title: track.title,
                          src,
                          duration: 15,
                          volume: 0.8,
                          genre: track.genre,
                          bpm: track.bpm,
                        });
                        audioPreviewRef.current?.pause();
                        setPlayingId(null);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-800 hover:bg-pink-500 hover:text-white text-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Applied
                        </>
                      ) : (
                        'Select'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
