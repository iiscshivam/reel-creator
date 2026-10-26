import { ReelProject, ExportResolution, AspectRatio } from '../types';
import { CanvasDimensions, getTotalDuration, renderFrame, mediaCache } from './engine';
import confetti from 'canvas-confetti';

export interface ExportProgress {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  status: 'preparing' | 'rendering' | 'encoding' | 'done' | 'error';
  errorMessage?: string;
}

export function getExportDimensions(
  aspectRatio: AspectRatio,
  resolution: ExportResolution = '720p'
): CanvasDimensions {
  switch (resolution) {
    case '480p':
      switch (aspectRatio) {
        case '9:16':
          return { width: 480, height: 854 };
        case '1:1':
          return { width: 480, height: 480 };
        case '16:9':
          return { width: 854, height: 480 };
      }
      break;

    case '1080p':
      switch (aspectRatio) {
        case '9:16':
          return { width: 1080, height: 1920 };
        case '1:1':
          return { width: 1080, height: 1080 };
        case '16:9':
          return { width: 1920, height: 1080 };
      }
      break;

    case '720p':
    default:
      switch (aspectRatio) {
        case '9:16':
          return { width: 720, height: 1280 };
        case '1:1':
          return { width: 720, height: 720 };
        case '16:9':
          return { width: 1280, height: 720 };
      }
  }
}

export async function exportReel(
  project: ReelProject,
  onProgress: (progress: ExportProgress) => void,
  resolution: ExportResolution = '720p'
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

  const dimensions = getExportDimensions(project.aspectRatio, resolution);
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

  let videoBitrate = 8000000;
  if (resolution === '1080p') videoBitrate = 16000000;
  else if (resolution === '480p') videoBitrate = 4000000;

  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: videoBitrate,
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

      renderFrame(
        ctx,
        project.clips,
        project.textOverlays,
        elapsed,
        dimensions,
        project.globalOverlay,
        project.stickerOverlays,
        project.backgroundColor,
        project.backgroundGradient
      );

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
