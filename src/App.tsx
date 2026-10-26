import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ReelProject,
  MediaClip,
  TextOverlay,
  StickerOverlay,
  AudioTrack,
  AspectRatio,
  OverlayEffect,
  TextAnimation,
  ExportResolution,
} from './types';
import {
  getInitialProject,
  generateCanvasPattern,
  createSynthAudioWav,
  autoSyncClipsToBpm,
} from './utils/sampleData';
import { getTotalDuration } from './utils/engine';
import { exportReel, ExportProgress } from './utils/exporter';
import { Header } from './components/Header';
import { MediaLibrary } from './components/MediaLibrary';
import { PhonePreview } from './components/PhonePreview';
import { Timeline } from './components/Timeline';
import { StudioSidePanel } from './components/StudioSidePanel';
import { ExportModal } from './components/ExportModal';
import { AudioModal } from './components/AudioModal';
import { OverlayModal } from './components/OverlayModal';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [project, setProject] = useState<ReelProject>(() => getInitialProject());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<ReelProject[]>([]);
  const [future, setFuture] = useState<ReelProject[]>([]);

  // Selection states
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Collapse / Minimize states
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState<boolean>(false);
  const [isMediaLibraryCollapsed, setIsMediaLibraryCollapsed] = useState<boolean>(false);

  // Modal dialog states
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState<boolean>(false);

  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  // Audio element for preview synchronization
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number | null>(null);

  const totalDuration = getTotalDuration(project.clips);

  // Project update with history tracking
  const updateProject = useCallback(
    (updater: ReelProject | ((prev: ReelProject) => ReelProject), addToHistory = true) => {
      setProject((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (addToHistory && prev !== next) {
          setHistory((h) => [...h.slice(-30), prev]);
          setFuture([]);
        }
        return next;
      });
    },
    []
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture((f) => [project, ...f]);
    setHistory((h) => h.slice(0, -1));
    setProject(previous);
  }, [history, project]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, project]);
    setFuture((f) => f.slice(1));
    setProject(next);
  }, [future, project]);

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

  // Keyboard shortcuts (Spacebar for play/pause, Ctrl+Z / Ctrl+Y for Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
    updateProject((prev) => ({ ...prev, aspectRatio: ratio }));
  };

  const handleChangeOverlay = (overlay: OverlayEffect) => {
    updateProject((prev) => ({ ...prev, globalOverlay: overlay }));
  };

  // One-Click Auto Beat-Sync
  const handleAutoSyncBeat = () => {
    const bpm = project.audioTrack?.bpm || 128;
    const syncedClips = autoSyncClipsToBpm(project.clips, bpm, 'fast');

    updateProject((prev) => ({
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
      italic: false,
      underline: false,
    };

    updateProject((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newText],
    }));

    setSelectedTextId(newText.id);
    setSelectedClipId(null);
    setSelectedStickerId(null);
    setIsSidePanelCollapsed(false);
  };

  const handleAddText = () => {
    handleAddCaption('NEW CAPTION ✨', 'pop');
  };

  // Add sticker hook
  const handleAddSticker = (emoji: string) => {
    const newSticker: StickerOverlay = {
      id: 'sticker-' + Date.now(),
      emoji,
      x: 50,
      y: 50,
      size: 72,
      rotation: 0,
    };

    updateProject((prev) => ({
      ...prev,
      stickerOverlays: [...(prev.stickerOverlays || []), newSticker],
    }));

    setSelectedStickerId(newSticker.id);
    setSelectedClipId(null);
    setSelectedTextId(null);
    setIsSidePanelCollapsed(false);
  };

  // Drag text position callback
  const handleUpdateTextPosition = useCallback((id: string, x: number, y: number) => {
    const normX = x <= 1 ? parseFloat((x * 100).toFixed(1)) : x;
    const normY = y <= 1 ? parseFloat((y * 100).toFixed(1)) : y;
    setProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) =>
        t.id === id ? { ...t, x: normX, y: normY } : t
      ),
    }));
  }, []);

  // Drag sticker position callback
  const handleUpdateStickerPosition = useCallback((id: string, x: number, y: number) => {
    const normX = x <= 1 ? parseFloat((x * 100).toFixed(1)) : x;
    const normY = y <= 1 ? parseFloat((y * 100).toFixed(1)) : y;
    setProject((prev) => ({
      ...prev,
      stickerOverlays: (prev.stickerOverlays || []).map((s) =>
        s.id === id ? { ...s, x: normX, y: normY } : s
      ),
    }));
  }, []);

  // Update sticker properties
  const handleUpdateSticker = (updated: StickerOverlay) => {
    updateProject((prev) => ({
      ...prev,
      stickerOverlays: (prev.stickerOverlays || []).map((s) =>
        s.id === updated.id ? updated : s
      ),
    }));
  };

  // Duplicate sticker
  const handleDuplicateSticker = (sticker: StickerOverlay) => {
    const dup: StickerOverlay = {
      ...sticker,
      id: 'sticker-' + Date.now(),
      x: Math.min(90, (sticker.x <= 1 ? sticker.x * 100 : sticker.x) + 5),
      y: Math.min(90, (sticker.y <= 1 ? sticker.y * 100 : sticker.y) + 5),
    };
    updateProject((prev) => ({
      ...prev,
      stickerOverlays: [...(prev.stickerOverlays || []), dup],
    }));
    setSelectedStickerId(dup.id);
  };

  // Delete sticker
  const handleDeleteSticker = (id: string) => {
    updateProject((prev) => ({
      ...prev,
      stickerOverlays: (prev.stickerOverlays || []).filter((s) => s.id !== id),
    }));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Add media clip
  const handleAddClip = (clipData: Omit<MediaClip, 'id'>) => {
    const newClip: MediaClip = {
      ...clipData,
      id: 'clip-' + Date.now(),
      motion: clipData.motion || (clipData.type === 'photo' ? 'zoom-in' : 'none'),
      volume: clipData.volume !== undefined ? clipData.volume : 1,
      muted: clipData.muted || false,
      speed: clipData.speed || 1,
    };

    updateProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));

    setSelectedClipId(newClip.id);
    setSelectedTextId(null);
    setSelectedStickerId(null);
    setIsSidePanelCollapsed(false);
  };

  // Move clip left or right
  const handleMoveClip = (index: number, direction: 'left' | 'right') => {
    updateProject((prev) => {
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
    updateProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) =>
        c.id === id
          ? {
              ...c,
              duration: Math.max(0.4, Math.min(15.0, parseFloat((c.duration + delta).toFixed(1)))),
            }
          : c
      ),
    }));
  };

  // Delete clip
  const handleDeleteClip = (id: string) => {
    updateProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== id),
    }));
    if (selectedClipId === id) setSelectedClipId(null);
  };

  // Delete text
  const handleDeleteText = (id: string) => {
    updateProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.filter((t) => t.id !== id),
    }));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Update clip properties
  const handleUpdateClip = (updatedClip: MediaClip) => {
    updateProject((prev) => ({
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
    updateProject((prev) => ({
      ...prev,
      clips: [...prev.clips, dup],
    }));
    setSelectedClipId(dup.id);
  };

  // Update text properties
  const handleUpdateText = (updatedText: TextOverlay) => {
    updateProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === updatedText.id ? updatedText : t)),
    }));
  };

  // Duplicate text
  const handleDuplicateText = (text: TextOverlay) => {
    const dup: TextOverlay = {
      ...text,
      id: 'text-' + Date.now(),
      y: Math.min(85, text.y + 8),
      text: `${text.text} (Copy)`,
    };
    updateProject((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, dup],
    }));
    setSelectedTextId(dup.id);
  };

  // Background color / gradient editor
  const handleUpdateBackground = (bg: { color?: string; gradient?: string[] }) => {
    updateProject((prev) => ({
      ...prev,
      backgroundColor: bg.color,
      backgroundGradient: bg.gradient,
    }));
  };

  // Set audio track
  const handleSetAudio = (audio: AudioTrack) => {
    updateProject((prev) => ({ ...prev, audioTrack: audio }));
  };

  const handleRemoveAudio = () => {
    updateProject((prev) => ({ ...prev, audioTrack: null }));
  };

  const handleUpdateAudioVolume = (vol: number) => {
    updateProject((prev) => ({
      ...prev,
      audioTrack: prev.audioTrack ? { ...prev.audioTrack, volume: vol } : null,
    }));
  };

  // Load preset templates
  const handleLoadTemplate = (templateName: string) => {
    if (templateName === 'photodump') {
      const p1 = generateCanvasPattern('sunset');
      const p2 = generateCanvasPattern('cyberpunk');
      const p3 = generateCanvasPattern('nature');
      const p4 = generateCanvasPattern('urban');
      const p5 = generateCanvasPattern('abstract');
      const audio = createSynthAudioWav('upbeat', 15);

      updateProject({
        id: 'proj-photodump',
        title: '2026 Camera Roll Dump',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'light-leak',
        backgroundColor: '#0A0D14',
        clips: [
          { id: 'pd-1', type: 'photo', title: 'Sunset Shot', src: p1, thumbnail: p1, duration: 0.94, transition: 'flash', filter: 'warm', fit: 'cover', motion: 'zoom-in', volume: 1, speed: 1 },
          { id: 'pd-2', type: 'photo', title: 'Neon Night', src: p2, thumbnail: p2, duration: 0.94, transition: 'flash', filter: 'cyberpunk', fit: 'cover', motion: 'zoom-out', volume: 1, speed: 1 },
          { id: 'pd-3', type: 'photo', title: 'Forest Calm', src: p3, thumbnail: p3, duration: 0.94, transition: 'flash', filter: 'vibrant', fit: 'cover', motion: 'pan-right', volume: 1, speed: 1 },
          { id: 'pd-4', type: 'photo', title: 'City Walk', src: p4, thumbnail: p4, duration: 0.94, transition: 'flash', filter: 'dramatic', fit: 'cover', motion: 'zoom-in', volume: 1, speed: 1 },
          { id: 'pd-5', type: 'photo', title: 'Festival Vibe', src: p5, thumbnail: p5, duration: 0.94, transition: 'crossfade', filter: 'normal', fit: 'cover', motion: 'zoom-out', volume: 1, speed: 1 },
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
        ],
        stickerOverlays: [
          { id: 'ps-1', emoji: '🔥', x: 80, y: 35, size: 68, rotation: 12 },
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
      const p1 = generateCanvasPattern('sunset');
      const p2 = generateCanvasPattern('nature');
      const audio = createSynthAudioWav('lofi', 15);

      updateProject({
        id: 'proj-film',
        title: '35mm Film Vlog',
        aspectRatio: '9:16',
        fps: 30,
        globalOverlay: 'vhs',
        backgroundColor: '#0A0D14',
        clips: [
          { id: 'f-1', type: 'photo', title: 'Analog Golden Hour', src: p1, thumbnail: p1, duration: 4.0, transition: 'crossfade', filter: 'vintage', fit: 'cover', motion: 'zoom-in', volume: 1, speed: 1 },
          { id: 'f-2', type: 'photo', title: 'Coastal Breeze', src: p2, thumbnail: p2, duration: 4.0, transition: 'fade-black', filter: 'warm', fit: 'cover', motion: 'zoom-out', volume: 1, speed: 1 },
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
        stickerOverlays: [
          { id: 'fs-1', emoji: '✨', x: 50, y: 25, size: 70, rotation: 0 },
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
    }

    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Export Reel Handlers
  const handleOpenExportModal = () => {
    setIsPlaying(false);
    setExportProgress(null);
    setExportedBlob(null);
    setIsExportOpen(true);
  };

  const handleStartExport = async (resolution: ExportResolution) => {
    setExportedBlob(null);

    try {
      const blob = await exportReel(
        project,
        (progress) => {
          setExportProgress(progress);
        },
        resolution
      );
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
  const selectedSticker = (project.stickerOverlays || []).find((s) => s.id === selectedStickerId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0D14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        onAddText={handleAddText}
        onExport={handleOpenExportModal}
        onLoadTemplate={handleLoadTemplate}
        onAutoSyncBeat={handleAutoSyncBeat}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenOverlayModal={() => setIsOverlayModalOpen(true)}
        globalOverlay={project.globalOverlay}
        totalDuration={totalDuration}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
      />

      {/* Main Center Area: Phone Preview Directly Visible with Full Space */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Side: Collapsible Media Library */}
        <MediaLibrary
          onAddClip={handleAddClip}
          onSetAudio={handleSetAudio}
          onAddCaption={handleAddCaption}
          onAddSticker={handleAddSticker}
          currentAudioId={project.audioTrack?.id}
          isCollapsed={isMediaLibraryCollapsed}
          onToggleCollapse={() => setIsMediaLibraryCollapsed((prev) => !prev)}
        />

        {/* Center: Live Phone Preview Canvas (Directly Visible, Centered, No Overlaps) */}
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
            setSelectedStickerId(null);
            setIsSidePanelCollapsed(false);
          }}
          onUpdateTextPosition={handleUpdateTextPosition}
          onSelectSticker={(sticker) => {
            setSelectedStickerId(sticker.id);
            setSelectedClipId(null);
            setSelectedTextId(null);
            setIsSidePanelCollapsed(false);
          }}
          onUpdateStickerPosition={handleUpdateStickerPosition}
        />
      </div>

      {/* Bottom Deck: Timeline (Left/Main) + Video Studio Options (Down and On Side) */}
      <div className="h-48 border-t border-slate-800 bg-[#0B0F17] flex shrink-0 z-20">
        {/* Left/Main: Multi-Track Timeline */}
        <div className="flex-1 h-full min-w-0">
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
              if (id) {
                setSelectedTextId(null);
                setSelectedStickerId(null);
                setIsSidePanelCollapsed(false);
              }
            }}
            selectedTextId={selectedTextId}
            onSelectText={(id) => {
              setSelectedTextId(id);
              if (id) {
                setSelectedClipId(null);
                setSelectedStickerId(null);
                setIsSidePanelCollapsed(false);
              }
            }}
            onMoveClip={handleMoveClip}
            onUpdateClipDuration={handleUpdateClipDuration}
            onDeleteClip={handleDeleteClip}
            onDeleteText={handleDeleteText}
            onOpenAudioModal={() => setIsAudioModalOpen(true)}
            onOpenOverlayModal={() => setIsOverlayModalOpen(true)}
          />
        </div>

        {/* Down and On Side: Video Studio Options Bar */}
        <StudioSidePanel
          selectedClip={selectedClip}
          selectedText={selectedText}
          selectedSticker={selectedSticker}
          onUpdateClip={handleUpdateClip}
          onUpdateText={handleUpdateText}
          onUpdateSticker={handleUpdateSticker}
          onDuplicateClip={handleDuplicateClip}
          onDuplicateText={handleDuplicateText}
          onDuplicateSticker={handleDuplicateSticker}
          onDeleteClip={handleDeleteClip}
          onDeleteText={handleDeleteText}
          onDeleteSticker={handleDeleteSticker}
          onAddSticker={handleAddSticker}
          onCloseSelection={() => {
            setSelectedClipId(null);
            setSelectedTextId(null);
            setSelectedStickerId(null);
          }}
          isCollapsed={isSidePanelCollapsed}
          onToggleCollapse={() => setIsSidePanelCollapsed((prev) => !prev)}
          onOpenAudioModal={() => setIsAudioModalOpen(true)}
          onOpenOverlayModal={() => setIsOverlayModalOpen(true)}
          onAutoSyncBeat={handleAutoSyncBeat}
          globalOverlay={project.globalOverlay}
          totalDuration={totalDuration}
          backgroundColor={project.backgroundColor}
          backgroundGradient={project.backgroundGradient}
          onUpdateBackground={handleUpdateBackground}
        />
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onStartExport={handleStartExport}
        progress={exportProgress}
        exportedBlob={exportedBlob}
        aspectRatio={project.aspectRatio}
      />

      <AudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        currentAudio={project.audioTrack}
        onSelectAudio={handleSetAudio}
        onRemoveAudio={handleRemoveAudio}
        onUpdateVolume={handleUpdateAudioVolume}
      />

      <OverlayModal
        isOpen={isOverlayModalOpen}
        onClose={() => setIsOverlayModalOpen(false)}
        currentOverlay={project.globalOverlay || 'none'}
        onSelectOverlay={handleChangeOverlay}
      />
    </div>
  );
};
export default App;
