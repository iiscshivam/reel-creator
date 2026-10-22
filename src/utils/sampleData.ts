import { MediaClip, TextOverlay, AudioTrack, ReelProject } from '../types';

// Helper to generate procedural audio WAV (Lo-Fi, Upbeat, Cinematic)
export function createSynthAudioWav(type: 'lofi' | 'upbeat' | 'cinematic', durationSec = 15): string {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSec;
  const buffer = new Float32Array(numSamples);

  const bpm = type === 'upbeat' ? 128 : type === 'lofi' ? 84 : 70;
  const beatInterval = (60 / bpm) * sampleRate;

  // Synthesize rhythmic pattern & chord progression
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatIndex = Math.floor(i / beatInterval);
    const posInBeat = (i % beatInterval) / beatInterval;

    let sample = 0;

    if (type === 'upbeat') {
      // 4-on-the-floor kick
      const kickEnv = Math.exp(-posInBeat * 16);
      const kickFreq = 130 * Math.exp(-posInBeat * 25) + 45;
      const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv;

      // Offbeat hi-hat
      const hatPos = ((i + beatInterval * 0.5) % beatInterval) / beatInterval;
      const hatEnv = Math.exp(-hatPos * 30);
      const hat = (Math.random() * 2 - 1) * hatEnv * 0.25;

      // Bass synth (progression: Am - F - C - G)
      const chordIndex = Math.floor(beatIndex / 4) % 4;
      const baseFreqs = [110, 87.31, 130.81, 98]; // A, F, C, G
      const bassFreq = baseFreqs[chordIndex];
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 +
                   Math.sin(2 * Math.PI * bassFreq * 2 * t) * 0.15;

      sample = kick * 0.6 + hat * 0.3 + bass * 0.4;
    } else if (type === 'lofi') {
      // Relaxed drum groove & warm Rhodes chords
      const kickHit = beatIndex % 4 === 0 || (beatIndex % 4 === 2 && posInBeat < 0.2);
      const kickEnv = kickHit ? Math.exp(-posInBeat * 10) : 0;
      const kick = Math.sin(2 * Math.PI * 65 * t) * kickEnv * 0.5;

      const snareHit = beatIndex % 4 === 2;
      const snareEnv = snareHit ? Math.exp(-posInBeat * 14) : 0;
      const snare = (Math.random() * 2 - 1) * snareEnv * 0.3;

      // Warm mellow chords
      const chordIndex = Math.floor(beatIndex / 8) % 4;
      const chords = [
        [220, 261.63, 329.63, 392],    // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196, 246.94, 293.66, 392],    // G7
        [164.81, 196, 246.94, 329.63]  // Em7
      ];
      let chordSample = 0;
      chords[chordIndex].forEach(f => {
        chordSample += Math.sin(2 * Math.PI * f * t) * 0.08;
      });

      // Vinyl crackle / hiss
      const crackle = (Math.random() * 2 - 1) * 0.015;

      sample = kick * 0.5 + snare * 0.4 + chordSample * 0.7 + crackle;
    } else {
      // Cinematic chill / ambient drone with sub bass
      const tNorm = t / durationSec;
      const swell = Math.sin(Math.PI * tNorm);
      const drone = Math.sin(2 * Math.PI * 55 * t) * 0.4 +
                    Math.sin(2 * Math.PI * 110 * t) * 0.25 +
                    Math.sin(2 * Math.PI * 164.81 * t) * 0.2;
      const shimmer = Math.sin(2 * Math.PI * 440 * t) * Math.sin(t * 3) * 0.05;
      sample = (drone + shimmer) * (0.4 + swell * 0.4);
    }

    // Clamp
    buffer[i] = Math.max(-1, Math.min(1, sample));
  }

  // Convert Float32Array to 16-bit PCM WAV Blob
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const pcmBytes = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    pcmBytes[i] = Math.max(-32768, Math.min(32767, buffer[i] * 32767));
  }

  const blob = new Blob([view, pcmBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generate stylized canvas imagery as fallback/instant data URLs
export function generateCanvasPattern(
  type: 'sunset' | 'cyberpunk' | 'nature' | 'urban' | 'abstract',
  width = 1080,
  height = 1920
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, width, height);

  if (type === 'sunset') {
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.3, '#ec4899');
    grad.addColorStop(0.7, '#8b5cf6');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Sun
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.45, 220, 0, Math.PI * 2);
    const sunGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 40, width * 0.5, height * 0.45, 220);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 1)');
    sunGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.8)');
    sunGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.7);
    ctx.lineTo(width * 0.3, height * 0.58);
    ctx.lineTo(width * 0.6, height * 0.68);
    ctx.lineTo(width * 0.85, height * 0.55);
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'cyberpunk') {
    grad.addColorStop(0, '#090a15');
    grad.addColorStop(0.5, '#2e0854');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= width; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 90) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (type === 'nature') {
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#059669');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Palm leaf shapes
    ctx.fillStyle = 'rgba(2, 44, 34, 0.7)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(width * (0.2 + i * 0.15), height * 0.85, 200, 700, -0.4 + i * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'urban') {
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // City skyline blocks
    ctx.fillStyle = '#020617';
    for (let i = 0; i < 12; i++) {
      const bh = 500 + Math.sin(i * 1.5) * 400;
      ctx.fillRect(i * (width / 10), height - bh, width / 11, bh);
    }
  } else {
    // Abstract neon particles
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Sample Curated Photos (Unsplash High-Res with direct CORS friendly query)
export const SAMPLE_PHOTOS = [
  {
    title: 'Neon Tokyo Night',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
    fallbackType: 'cyberpunk' as const
  },
  {
    title: 'Golden Sunset Cliffs',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
    fallbackType: 'sunset' as const
  },
  {
    title: 'Emerald Forest Mist',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&q=80',
    fallbackType: 'nature' as const
  },
  {
    title: 'Minimalist Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=80',
    fallbackType: 'urban' as const
  },
  {
    title: 'Vibrant Festival Lights',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1080&q=80',
    fallbackType: 'abstract' as const
  }
];

// Sample Curated Short Video Loops (Public CDN Royalty-Free)
export const SAMPLE_VIDEOS = [
  {
    title: 'Neon Particle Tunnel',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-starfield-in-space-26618-large.mp4',
    duration: 6
  },
  {
    title: 'Ocean Sunset Waves',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    duration: 5
  },
  {
    title: 'Urban Street Motion',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
    duration: 6
  }
];

// Initial Demo Project preset loaded on launch
export function getInitialProject(): ReelProject {
  // Generate procedural patterns for guaranteed instant load
  const img1 = generateCanvasPattern('sunset', 1080, 1920);
  const img2 = generateCanvasPattern('cyberpunk', 1080, 1920);
  const img3 = generateCanvasPattern('nature', 1080, 1920);
  const audioBlob = createSynthAudioWav('upbeat', 15);

  const initialClips: MediaClip[] = [
    {
      id: 'clip-1',
      type: 'photo',
      title: 'Golden Sunset',
      src: img1,
      thumbnail: img1,
      duration: 3.5,
      transition: 'crossfade',
      filter: 'warm',
      fit: 'cover'
    },
    {
      id: 'clip-2',
      type: 'photo',
      title: 'Neon Cyberpunk',
      src: img2,
      thumbnail: img2,
      duration: 3.5,
      transition: 'zoom-in',
      filter: 'cyberpunk',
      fit: 'cover'
    },
    {
      id: 'clip-3',
      type: 'photo',
      title: 'Emerald Palms',
      src: img3,
      thumbnail: img3,
      duration: 3.0,
      transition: 'slide-left',
      filter: 'vibrant',
      fit: 'cover'
    }
  ];

  const initialTexts: TextOverlay[] = [
    {
      id: 'text-1',
      text: 'CHASING HORIZONS ✨',
      startTime: 0.5,
      duration: 3.0,
      x: 50,
      y: 35,
      fontSize: 38,
      fontFamily: 'Outfit',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      animation: 'pop',
      align: 'center',
      bold: true
    },
    {
      id: 'text-2',
      text: 'NEON NIGHTS ⚡',
      startTime: 3.6,
      duration: 3.2,
      x: 50,
      y: 78,
      fontSize: 34,
      fontFamily: 'Bebas Neue',
      color: '#38BDF8',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      animation: 'slide-up',
      align: 'center',
      bold: true
    },
    {
      id: 'text-3',
      text: 'CREATE YOUR REEL TODAY',
      startTime: 7.2,
      duration: 2.8,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: 'Inter',
      color: '#F43F5E',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      animation: 'fade',
      align: 'center',
      bold: true
    }
  ];

  const initialAudio: AudioTrack = {
    id: 'audio-upbeat',
    title: 'Upbeat Electro Beat (Synth)',
    src: audioBlob,
    duration: 15,
    volume: 0.8,
    genre: 'Electronic',
    artist: 'Reel Studio Synth'
  };

  return {
    id: 'proj-reel-1',
    title: 'My First Reel',
    aspectRatio: '9:16',
    clips: initialClips,
    textOverlays: initialTexts,
    audioTrack: initialAudio,
    fps: 30
  };
}
