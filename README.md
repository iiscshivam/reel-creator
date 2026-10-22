# Reel Creator 🎬⚡

> **Turn your photos and videos into viral Instagram Reels, TikToks, and YouTube Shorts in seconds — 100% in your browser.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)

**Reel Creator** is a modern, responsive web application studio designed for creators, marketers, and developers to craft stunning short-form vertical reels from images, videos, audio soundtracks, and animated text overlays.

---

## ✨ Features

- 📱 **Multi-Aspect Ratio Canvas**:
  - **9:16 Vertical Reel** (Instagram Reels, TikTok, YouTube Shorts, WhatsApp Status)
  - **1:1 Square Feed** (Instagram / LinkedIn / Facebook posts)
  - **16:9 Landscape Video** (YouTube / desktop monitors)

- 📸 **Media Ingestion & Free Stock Assets**:
  - Drag-and-drop or file picker for local videos (`.mp4`, `.webm`, `.mov`), photos (`.jpg`, `.png`, `.webp`), and audio (`.mp3`, `.wav`).
  - Preloaded stock photo library and looping video clips.
  - Built-in procedural imagery generator for instant offline testing.

- ⏱️ **Multi-Track Interactive Timeline**:
  - Visual tracks for Media Clips, Animated Text Captions, and Audio Soundtracks.
  - Reorder clips with one click (Move Left / Move Right).
  - Adjust clip durations on the fly with duration resize controls.
  - Interactive playhead scrubbing across the entire composite reel.

- 🎨 **Cinematic Filters & Grading**:
  - Original, Vibrant Pop, 90s Vintage Film, High-Contrast Noir, Golden Hour Sunset, Cyberpunk Neon, and Dramatic Film Curve.

- 🔄 **Dynamic Video Transitions**:
  - Crossfade, Zoom In, Slide Left, Fade to Black, and White Flash between sequential clips.

- ✍️ **Animated Text Overlays & Captions**:
  - Add text cards with custom fonts (*Outfit, Inter, Bebas Neue, Playfair Display*).
  - Customizable colors, background pill styles, font sizes, and positioning.
  - Intro animations: *Pop Bounce, Slide Up, Smooth Fade, Typewriter*.

- 🎵 **Web Audio Soundtrack & Synthesizer**:
  - Built-in procedural audio synth tracks (*Upbeat Electro Dance 128 BPM, Chilled Lo-Fi 84 BPM, Cinematic Ambient Flow 70 BPM*).
  - Upload custom MP3 / WAV background music.
  - Audio waveform preview, volume control, and mute toggle.

- 🚀 **100% Client-Side Video Export**:
  - Exports directly to `.webm` / `.mp4` using HTML5 Canvas `captureStream()`, Web Audio API, and `MediaRecorder`.
  - Zero server requirements, no video upload queues, and complete privacy for user assets.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Media**: Web Audio API, HTML5 Canvas 2D, MediaStream Recording API
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/iiscshivam/reel-creator.git
cd reel-creator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for production
```bash
npm run build
```
The optimized static bundle will be built in the `dist/` directory.

---

## 🎬 How It Works

```
+--------------------------------------------------------------------+
|                         Reel Creator Studio                        |
|                                                                    |
|  [Media Library]           [Phone Canvas HUD]       [Inspector]   |
|  - Upload Video/Photo      - 9:16 Realtime Player   - Filter Mode  |
|  - Stock Assets            - Transitions Engine     - Transitions  |
|  - Synth Audio Beats       - Text Overlay Render    - Font/Styles  |
|                                                                    |
|  ----------------------------------------------------------------  |
|  [Multi-Track Timeline]                                            |
|  - Track 1: Text Layers with In/Out Timing                         |
|  - Track 2: Photo & Video Clips with Duration Resize & Reordering  |
|  - Track 3: Audio Soundtrack Track with Waveform Indicator         |
|  - Scrubbable Playhead Tracker (0.0s -> Total)                     |
|                                                                    |
|  ----------------------------------------------------------------  |
|  [Canvas Exporter] -> MediaRecorder -> Downloadable Video File     |
+--------------------------------------------------------------------+
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
