import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReelProject, MediaClip, TextOverlay, AudioTrack, AspectRatio, OverlayEffect, TextAnimation } from './types';
import { getInitialProject, generateCanvasPattern, createSynthAudioWav, autoSyncClipsToBpm } from './utils/sampleData';
import { getTotalDuration } from './utils/engine';
import { exportReel, ExportProgress } from './utils/exporter';
import { Header } from './components/Header';
import { MediaLibrary } from './components/MediaLibrary';
import { PhonePreview } from './components/PhonePreview';
import { Timeline } from './components/Timeline';
import { InspectorPanel } from './components/InspectorPanel';
import { ExportModal } from './components/ExportModal';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [project, setProject] = useState<ReelProject>(() => getInitialProject());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Selection states
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Export states
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  // Audio element for preview synchronization
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number | null>(null);

  const totalDuration = getTotalDuration(project.clips);

  // Set up preview audio
  useEffect(() => {
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio();
    }
    if (project.audioTrack && project.audioTrack.src) {
      audioPreviewRef.current.src = project.audioTrack.src;
      audioPreviewRef.current.volume = isMuted ? 0 : project.audioTrack.volume;
    } else {
      audioPreviewRef.current.pause();
    }
  }, [project.audioTrack, isMuted]);

  // Main playback animation loop
  const updatePlayback = useCallback(() => {
    if (!isPlaying) return;

    const now = performance.now();
    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setCurrentTime((prevTime) => {
      let nextTime = prevTime + delta;

      if (nextTime >= totalDuration) {
        if (isLooping) {
          nextTime = 0;
          if (audioPreviewRef.current && project.audioTrack) {
            audioPreviewRef.current.currentTime = 0;
            audioPreviewRef.current.play().catch(console.warn);
          }
        } else {
          setIsPlaying(false);
          audioPreviewRef.current?.pause();
          return totalDuration;
        }
      }
      return nextTime;
    });

    animFrameRef.current = requestAnimationFrame(updatePlayback);
  }, [isPlaying, totalDuration, isLooping, project.audioTrack]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updatePlayback);

      if (audioPreviewRef.current && project.audioTrack && !isMuted) {
        audioPreviewRef.current.currentTime = currentTime % (project.audioTrack.duration || 15);
        audioPreviewRef.current.play().catch(console.warn);
      }
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioPreviewRef.current?.pause();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, updatePlayback, currentTime, project.audioTrack, isMuted]);

  // Spacebar play/pause shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (time: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, time));
    setCurrentTime(clamped);
    if (audioPreviewRef.current && project.audioTrack) {
      audioPreviewRef.current.currentTime = clamped % (project.audioTrack.duration || 15);
    }
  };

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setProject((prev) => ({ ...prev, aspectRatio: ratio }));
  };

  const handleChangeOverlay = (overlay: OverlayEffect) => {
    setProject((prev) => ({ ...prev, globalOverlay: overlay }));
  };

  // One-Click Auto Beat-Sync
  const handleAutoSyncBeat = () => {
    const bpm = project.audioTrack?.bpm || 128;
    const syncedClips = autoSyncClipsToBpm(project.clips, bpm, 'fast');

    setProject((prev) => ({
      ...prev,
      clips: syncedClips,
    }));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Add caption hook
  const handleAddCaption = (text: string, animation: TextAnimation = 'pop') => {
    const newText: TextOverlay = {
      id: 'text-' + Date.now(),
      text,
      startTime: Math.max(0, parseFloat(currentTime.toFixed(1))),
      duration: 3.0,
      x: 50,
      y: 45,
      fontSize: 34,
      fontFamily: 'Outfit',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      animation,
      align: 'center',
      bold: true,
    };

    setProject((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newText],
    }));

    setSelectedTextId(newText.id);
    setSelectedClipId(null);
  };

  // Add text overlay
  const handleAddText = () => {
    handleAddCaption('NEW CAPTION ✨', 'pop');
  };

  // Add media clip
  const handleAddClip = (clipData: Omit<MediaClip, 'id'>) => {
    const newClip: MediaClip = {
      ...clipData,
      id: 'clip-' + Date.now(),
      motion: clipData.motion || (clipData.type === 'photo' ? 'zoom-in' : 'none'),
    };

    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));

    setSelectedClipId(newClip.id);
    setSelectedTextId(null);
  };

  // Move clip left or right
  const handleMoveClip = (index: number, direction: 'left' | 'right') => {
    setProject((prev) => {
      const newClips = [...prev.clips];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newClips.length) return prev;

      const temp = newClips[index];
      newClips[index] = newClips[targetIndex];
      newClips[targetIndex] = temp;
      return { ...prev, clips: newClips };
    });
  };

  // Update clip duration
  const handleUpdateClipDuration = (id: string, delta: number) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) =>
        c.id === id ? { ...c, duration: Math.max(0.4, Math.min(15.0, parseFloat((c.duration + delta).toFixed(1)))) } : c
      ),
    }));
  };

  // Delete clip
  const handleDeleteClip = (id: string) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== id),
    }));
    if (selectedClipId === id) setSelectedClipId(null);
  };

  // Delete text
  const handleDeleteText = (id: string) => {
    setProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.filter((t) => t.id !== id),
    }));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Update clip properties
  const handleUpdateClip = (updatedClip: MediaClip) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
    }));
  };

  // Duplicate clip
  const handleDuplicateClip = (clip: MediaClip) => {
    const dup: MediaClip = {
      ...clip,
      id: 'clip-' + Date.now(),
      title: `${clip.title} (Copy)`,
    };
    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, dup],
    }));
    setSelectedClipId(dup.id);
  };

  // Update text properties
  const handleUpdateText = (updatedText: TextOverlay) => {
    setProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === updatedText.id ? updatedText : t)),
    }));
  };

  // Set audio track
  const handleSetAudio = (audio: AudioTrack) => {
    setProject((prev) => ({ ...prev, audioTrack: audio }));
  };

  // Load preset templates
  const handleLoadTemplate = (templateName: string) => {
    if (templateName === 'photodump') {
      // 5 fast snappy beat-synced photos (CapCut #1 style)
      const p1 = generateCanvasPattern('sunset');
      const p2 = generateCanvasPattern('cyberpunk');
      const p3 = generateCanvasPattern('nature');
      const p4 = generateCanvasPattern('urban');
      const p5 = generateCanvasPattern('abstract');
      const audio = createSynthAudioWav('upbeat', 15);

      setProject({
        id: 'proj-photodump',
        title: '2026 Camera Roll Dump',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'light-leak',
        clips: [
          { id: 'pd-1', type: 'photo', title: 'Sunset Shot', src: p1, thumbnail: p1, duration: 0.94, transition: 'flash', filter: 'warm', fit: 'cover', motion: 'zoom-in' },
          { id: 'pd-2', type: 'photo', title: 'Neon Night', src: p2, thumbnail: p2, duration: 0.94, transition: 'flash', filter: 'cyberpunk', fit: 'cover', motion: 'zoom-out' },
          { id: 'pd-3', type: 'photo', title: 'Forest Calm', src: p3, thumbnail: p3, duration: 0.94, transition: 'flash', filter: 'vibrant', fit: 'cover', motion: 'pan-right' },
          { id: 'pd-4', type: 'photo', title: 'City Walk', src: p4, thumbnail: p4, duration: 0.94, transition: 'flash', filter: 'dramatic', fit: 'cover', motion: 'zoom-in' },
          { id: 'pd-5', type: 'photo', title: 'Festival Vibe', src: p5, thumbnail: p5, duration: 0.94, transition: 'crossfade', filter: 'normal', fit: 'cover', motion: 'zoom-out' },
        ],
        textOverlays: [
          {
            id: 'pt-1',
            text: 'CAMERA ROLL DUMP 📸',
            startTime: 0.2,
            duration: 2.5,
            x: 50,
            y: 35,
            fontSize: 36,
            fontFamily: 'Outfit',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            animation: 'pop',
            align: 'center',
            bold: true,
          },
          {
            id: 'pt-2',
            text: '2026 MEMORIES ✨',
            startTime: 2.8,
            duration: 1.8,
            x: 50,
            y: 75,
            fontSize: 34,
            fontFamily: 'Bebas Neue',
            color: '#F43F5E',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            animation: 'slide-up',
            align: 'center',
            bold: true,
          }
        ],
        audioTrack: {
          id: 'audio-upbeat',
          title: 'Upbeat Electro Beat',
          src: audio,
          duration: 15,
          volume: 0.85,
          genre: 'Electronic',
          bpm: 128,
        },
      });
    } else if (templateName === 'filmvlog') {
      // 35mm film vintage vlog with VHS stamp (VSCO aesthetic style)
      const p1 = generateCanvasPattern('sunset');
      const p2 = generateCanvasPattern('nature');
      const audio = createSynthAudioWav('lofi', 15);

      setProject({
        id: 'proj-film',
        title: '35mm Film Vlog',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'vhs',
        clips: [
          { id: 'f-1', type: 'photo', title: 'Analog Golden Hour', src: p1, thumbnail: p1, duration: 4.0, transition: 'crossfade', filter: 'vintage', fit: 'cover', motion: 'zoom-in' },
          { id: 'f-2', type: 'photo', title: 'Coastal Breeze', src: p2, thumbnail: p2, duration: 4.0, transition: 'fade-black', filter: 'warm', fit: 'cover', motion: 'zoom-out' },
        ],
        textOverlays: [
          {
            id: 'ft-1',
            text: 'ROMANTICIZE YOUR LIFE 🕊️',
            startTime: 0.5,
            duration: 3.5,
            x: 50,
            y: 40,
            fontSize: 32,
            fontFamily: 'Playfair Display',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            animation: 'fade',
            align: 'center',
            bold: true,
          },
        ],
        audioTrack: {
          id: 'audio-lofi',
          title: 'Chilled Lo-Fi Sunset',
          src: audio,
          duration: 15,
          volume: 0.8,
          genre: 'Lo-Fi',
          bpm: 84,
        },
      });
    } else if (templateName === 'sunset') {
      const img1 = generateCanvasPattern('sunset');
      const img2 = generateCanvasPattern('nature');
      const audio = createSynthAudioWav('lofi', 15);

      setProject({
        id: 'proj-sunset',
        title: 'Golden Sunset Vibe',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'light-leak',
        clips: [
          { id: 's-1', type: 'photo', title: 'Golden Hour', src: img1, thumbnail: img1, duration: 4.0, transition: 'crossfade', filter: 'warm', fit: 'cover', motion: 'zoom-in' },
          { id: 's-2', type: 'photo', title: 'Tropical Calm', src: img2, thumbnail: img2, duration: 4.0, transition: 'fade-black', filter: 'vibrant', fit: 'cover', motion: 'zoom-out' },
        ],
        textOverlays: [
          {
            id: 'st-1',
            text: 'GOLDEN HOUR MAGIC ✨',
            startTime: 0.5,
            duration: 3.5,
            x: 50,
            y: 40,
            fontSize: 36,
            fontFamily: 'Outfit',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            animation: 'pop',
            align: 'center',
            bold: true,
          },
        ],
        audioTrack: {
          id: 'audio-lofi',
          title: 'Chilled Lo-Fi Sunset',
          src: audio,
          duration: 15,
          volume: 0.85,
          genre: 'Lo-Fi',
          bpm: 84,
        },
      });
    } else if (templateName === 'cyberpunk') {
      const img1 = generateCanvasPattern('cyberpunk');
      const img2 = generateCanvasPattern('urban');
      const audio = createSynthAudioWav('upbeat', 15);

      setProject({
        id: 'proj-cyber',
        title: 'Cyberpunk Neon',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'viewfinder',
        clips: [
          { id: 'c-1', type: 'photo', title: 'Tokyo Neon Grid', src: img1, thumbnail: img1, duration: 3.5, transition: 'zoom-in', filter: 'cyberpunk', fit: 'cover', motion: 'zoom-in' },
          { id: 'c-2', type: 'photo', title: 'Metropolis Skyline', src: img2, thumbnail: img2, duration: 3.5, transition: 'flash', filter: 'noir', fit: 'cover', motion: 'zoom-out' },
        ],
        textOverlays: [
          {
            id: 'ct-1',
            text: 'FUTURE CITY ⚡ 2099',
            startTime: 0.5,
            duration: 3.0,
            x: 50,
            y: 35,
            fontSize: 38,
            fontFamily: 'Bebas Neue',
            color: '#38BDF8',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            animation: 'slide-up',
            align: 'center',
            bold: true,
          },
        ],
        audioTrack: {
          id: 'audio-cyber',
          title: 'Upbeat Electro Beat',
          src: audio,
          duration: 15,
          volume: 0.8,
          genre: 'Electronic',
          bpm: 128,
        },
      });
    }

    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Export Reel Handler
  const handleExportReel = async () => {
    setIsPlaying(false);
    setIsExportOpen(true);
    setExportedBlob(null);

    try {
      const blob = await exportReel(project, (progress) => {
        setExportProgress(progress);
      });
      setExportedBlob(blob);
    } catch (err: any) {
      setExportProgress({
        percentage: 0,
        currentSecond: 0,
        totalSeconds: totalDuration,
        status: 'error',
        errorMessage: err?.message || 'Failed to export reel.',
      });
    }
  };

  const selectedClip = project.clips.find((c) => c.id === selectedClipId) || null;
  const selectedText = project.textOverlays.find((t) => t.id === selectedTextId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0D14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        onAddText={handleAddText}
        onExport={handleExportReel}
        onLoadTemplate={handleLoadTemplate}
        onAutoSyncBeat={handleAutoSyncBeat}
        globalOverlay={project.globalOverlay}
        onChangeOverlay={handleChangeOverlay}
        totalDuration={totalDuration}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Media Library & Uploads */}
        <MediaLibrary
          onAddClip={handleAddClip}
          onSetAudio={handleSetAudio}
          onAddCaption={handleAddCaption}
          currentAudioId={project.audioTrack?.id}
        />

        {/* Center: Live Phone Preview Canvas */}
        <PhonePreview
          project={project}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          totalDuration={totalDuration}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping((prev) => !prev)}
          onSelectText={(text) => {
            setSelectedTextId(text.id);
            setSelectedClipId(null);
          }}
        />

        {/* Right: Inspector Properties Panel */}
        <InspectorPanel
          selectedClip={selectedClip}
          selectedText={selectedText}
          onUpdateClip={handleUpdateClip}
          onUpdateText={handleUpdateText}
          onDuplicateClip={handleDuplicateClip}
          onDeleteClip={handleDeleteClip}
          onDeleteText={handleDeleteText}
          globalOverlay={project.globalOverlay}
          onChangeOverlay={handleChangeOverlay}
          totalDuration={totalDuration}
        />
      </div>

      {/* Bottom: Multi-Track Timeline */}
      <Timeline
        clips={project.clips}
        textOverlays={project.textOverlays}
        audioTrack={project.audioTrack}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeek={handleSeek}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => {
          setSelectedClipId(id);
          if (id) setSelectedTextId(null);
        }}
        selectedTextId={selectedTextId}
        onSelectText={(id) => {
          setSelectedTextId(id);
          if (id) setSelectedClipId(null);
        }}
        onMoveClip={handleMoveClip}
        onUpdateClipDuration={handleUpdateClipDuration}
        onDeleteClip={handleDeleteClip}
        onDeleteText={handleDeleteText}
      />

      {/* Export Progress / Done Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        progress={exportProgress}
        exportedBlob={exportedBlob}
      />
    </div>
  );
};
export default App;
