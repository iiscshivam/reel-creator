import { ReelProject } from '../types';
import { getCanvasDimensions, getTotalDuration, renderFrame, mediaCache } from './engine';
import confetti from 'canvas-confetti';

export interface ExportProgress {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  status: 'preparing' | 'rendering' | 'encoding' | 'done' | 'error';
  errorMessage?: string;
}

export async function exportReel(
  project: ReelProject,
  onProgress: (progress: ExportProgress) => void
): Promise<Blob> {
  const totalDuration = getTotalDuration(project.clips);
  if (totalDuration <= 0) {
    throw new Error('Project has 0 duration. Add clips before exporting.');
  }

  onProgress({
    percentage: 0,
    currentSecond: 0,
    totalSeconds: totalDuration,
    status: 'preparing',
  });

  // Pre-load all assets first
  for (const clip of project.clips) {
    if (clip.type === 'photo') {
      await mediaCache.getImage(clip.src);
    }
  }

  const dimensions = getCanvasDimensions(project.aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not initialize canvas context for export.');
  }

  // Setup Web Audio if audioTrack exists
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  let audioElement: HTMLAudioElement | null = null;

  if (project.audioTrack && project.audioTrack.src) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioDestination = audioContext.createMediaStreamDestination();
      audioElement = new Audio(project.audioTrack.src);
      audioElement.crossOrigin = 'anonymous';
      audioElement.volume = project.audioTrack.volume;
      const audioSource = audioContext.createMediaElementSource(audioElement);
      audioSource.connect(audioDestination);
      audioSource.connect(audioContext.destination);
    } catch (e) {
      console.warn('Audio setup for export fallback:', e);
    }
  }

  // Choose supported MIME type
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
  ];
  let selectedMimeType = '';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  if (!selectedMimeType) {
    selectedMimeType = 'video/webm';
  }

  const fps = 30;
  const stream = canvas.captureStream(fps);

  if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
    audioDestination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high quality
  });

  const recordedChunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      if (audioElement) {
        audioElement.pause();
      }

      const outputBlob = new Blob(recordedChunks, { type: selectedMimeType });

      onProgress({
        percentage: 100,
        currentSecond: totalDuration,
        totalSeconds: totalDuration,
        status: 'done',
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      resolve(outputBlob);
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    recorder.start(100);

    // If audio is present, play it in sync
    if (audioElement && audioContext) {
      audioContext.resume().then(() => {
        audioElement?.play().catch(console.warn);
      });
    }

    onProgress({
      percentage: 0,
      currentSecond: 0,
      totalSeconds: totalDuration,
      status: 'rendering',
    });

    // Real-time animation loop step
    const intervalTime = 1000 / fps;
    let elapsed = 0;

    const exportTimer = setInterval(() => {
      elapsed += 1 / fps;

      renderFrame(ctx, project.clips, project.textOverlays, elapsed, dimensions);

      const percent = Math.min(99, Math.round((elapsed / totalDuration) * 100));
      onProgress({
        percentage: percent,
        currentSecond: parseFloat(elapsed.toFixed(1)),
        totalSeconds: parseFloat(totalDuration.toFixed(1)),
        status: 'rendering',
      });

      if (elapsed >= totalDuration) {
        clearInterval(exportTimer);
        onProgress({
          percentage: 99,
          currentSecond: totalDuration,
          totalSeconds: totalDuration,
          status: 'encoding',
        });
        setTimeout(() => {
          recorder.stop();
        }, 300);
      }
    }, intervalTime);
  });
}

// Download blob directly to user's computer
export function downloadBlob(blob: Blob, filename = 'reel-creator.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
