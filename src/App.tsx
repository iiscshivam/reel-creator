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
  autoSyncClipsToBpm,
} from './utils/sampleData';
import { getTotalDuration } from './utils/engine';
import { exportReel, ExportProgress } from './utils/exporter';
import { Header } from './components/Header';
import { ToolRail, ToolType } from './components/ToolRail';
import { AssetDrawer } from './components/AssetDrawer';
import { PhonePreview } from './components/PhonePreview';
import { Timeline } from './components/Timeline';
import { Inspector } from './components/Inspector';
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

  // New Drawer & Inspector states
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

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

  // Toggle active tool in left ToolRail
  const handleToolChange = (tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
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
    setIsInspectorOpen(true);
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
    setIsInspectorOpen(true);
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
    setIsInspectorOpen(true);
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
    setIsInspectorOpen(true);
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
    setIsInspectorOpen(true);
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
    setIsInspectorOpen(true);
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
    <div
      className="h-screen w-screen bg-[#0E0E0E] text-slate-100 overflow-hidden font-sans"
      style={{ display: 'grid', gridTemplateRows: '48px 1fr 208px', gridTemplateColumns: '1fr' }}
    >
      {/* Row 1: Header */}
      <Header
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        onExport={handleOpenExportModal}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        totalDuration={totalDuration}
      />

      {/* Row 2: Main work area */}
      <div className="flex min-h-0 overflow-hidden">
        {/* Left: Tool Rail + Drawer */}
        <ToolRail activeTool={activeTool} onToolChange={handleToolChange} />
        {activeTool && (
          <AssetDrawer
            activeTool={activeTool}
            isOpen={true}
            onClose={() => setActiveTool(null)}
            onAddClip={handleAddClip}
            onSetAudio={handleSetAudio}
            onAddCaption={handleAddCaption}
            onAddSticker={handleAddSticker}
            onOpenOverlayModal={() => setIsOverlayModalOpen(true)}
            onOpenAudioModal={() => setIsAudioModalOpen(true)}
            currentAudioId={project.audioTrack?.id}
          />
        )}

        {/* Center: Phone Preview */}
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
            setIsInspectorOpen(true);
          }}
          onUpdateTextPosition={handleUpdateTextPosition}
          onSelectSticker={(sticker) => {
            setSelectedStickerId(sticker.id);
            setSelectedClipId(null);
            setSelectedTextId(null);
            setIsInspectorOpen(true);
          }}
          onUpdateStickerPosition={handleUpdateStickerPosition}
        />

        {/* Right: Inspector */}
        <Inspector
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
          onOpenAudioModal={() => setIsAudioModalOpen(true)}
          onOpenOverlayModal={() => setIsOverlayModalOpen(true)}
          onAutoSyncBeat={handleAutoSyncBeat}
          globalOverlay={project.globalOverlay}
          totalDuration={totalDuration}
          backgroundColor={project.backgroundColor}
          backgroundGradient={project.backgroundGradient}
          onUpdateBackground={handleUpdateBackground}
          isCollapsed={!isInspectorOpen}
          onToggleCollapse={() => setIsInspectorOpen((prev) => !prev)}
        />
      </div>

      {/* Row 3: Full-width Timeline */}
      <div className="border-t border-[#2A2A2A] h-[208px] overflow-hidden">
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
              setIsInspectorOpen(true);
            }
          }}
          selectedTextId={selectedTextId}
          onSelectText={(id) => {
            setSelectedTextId(id);
            if (id) {
              setSelectedClipId(null);
              setSelectedStickerId(null);
              setIsInspectorOpen(true);
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
