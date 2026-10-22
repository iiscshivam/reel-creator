# Reel Creator 🎬⚡

> **Turn your photos and videos into viral Instagram Reels, TikToks, and YouTube Shorts in seconds — 100% in your browser.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)

**Reel Creator** is a modern, responsive web application studio designed for creators, marketers, and developers. Built from deep research of online reviews of top photo editing and reel maker apps (**CapCut**, **InShot**, and **VSCO**), it combines the most loved features of each while eliminating common creator pain points (paywalls, aggressive ads, watermarks, and rigid editing).

---

## 💡 Built from Real Creator Reviews

| Review Insight | The Industry Problem | How Reel Creator Solves It |
|---|---|---|
| **CapCut #1 Praise: Beat-Sync & Templates** | Users love viral 0.5s photo dumps synced to music, but hate aggressive paywalls and cloud clutter. | **1-Click ⚡ Auto Beat-Sync** that automatically calculates BPM and snaps all photo cuts to music bars, plus 1-tap viral templates — completely free. |
| **InShot #1 Praise: Simplicity & Speed** | Creators want a clean, fast timeline without a steep learning curve, but hate export watermarks and banner ads. | **Clutter-free multi-track timeline** with zero watermarks, zero ads, and instant keyboard shortcuts. |
| **VSCO #1 Praise: Analog Film Aesthetics** | Users love VSCO's 35mm grain and warm mood, but complain that VSCO is strictly for static photos and cannot make reels. | **Aesthetic Film Overlays & Ken Burns Motion**: 35mm Film Grain, Retro VHS 2026 OSD, Golden Light Leaks, and smooth Ken Burns pan/zoom on static photos. |
| **Privacy & Cloud Concerns** | Users worry about ByteDance/CapCut server uploads and slow render queues. | **100% Client-Side In-Browser Video Export** via Web Audio API, Canvas `captureStream()`, and `MediaRecorder`. |

---

## ✨ Core Features

- 📱 **Multi-Aspect Ratio Canvas**:
  - **9:16 Vertical Reel** (Instagram Reels, TikTok, YouTube Shorts, WhatsApp Status)
  - **1:1 Square Feed** (Instagram / LinkedIn / Facebook posts)
  - **16:9 Landscape Video** (YouTube / desktop monitors)

- ⚡ **1-Click AI Beat-Sync**:
  - Automatically calculates beats from the audio track (128 BPM, 84 BPM, etc.) and snaps all photo and video cuts to exact rhythmic intervals.

- 🎥 **Ken Burns Dynamic Motion for Photos**:
  - Automatically brings static photos to life with cinematic motion: *Slow Zoom In, Slow Zoom Out, Pan Right, and Pan Left*.

- 🎞️ **Analog Film & Aesthetic Overlays**:
  - *35mm Film Grain* (analog organic grain)
  - *Retro VHS 2026* (CRT scanlines, fluor red REC ●, live timecode, date stamp)
  - *Golden Light Leak* (warm cinematic sunset flare)
  - *4K Camera Viewfinder* (professional bracket grid, ISO, FPS HUD)

- 💬 **1-Click Viral Caption Hooks**:
  - Quick library of trending hooks (*"POV: You found your aesthetic ✨", "Core memories unlocked 🌊", "Golden hour hits different ☀️"*) with instant intro animations.

- ⏱️ **Multi-Track Interactive Timeline**:
  - Visual tracks for Media Clips, Animated Text Captions, and Audio Soundtracks.
  - Reorder clips with one click (Move Left / Move Right).
  - Adjust clip durations with duration resize controls (`+` / `-`).
  - Interactive playhead scrubbing across the entire composite reel.

- 🎨 **Cinematic Filters & Grading**:
  - Original, Vibrant Pop, 90s Vintage Film, High-Contrast Noir, Golden Hour Sunset, Cyberpunk Neon, and Dramatic Film Curve.

- 🔄 **Dynamic Video Transitions**:
  - Crossfade, Zoom In, Slide Left, Fade to Black, and White Flash between sequential clips.

- 🎵 **Web Audio Soundtrack & Synthesizer**:
  - Built-in procedural synth tracks (*Upbeat Electro Dance 128 BPM, Chilled Lo-Fi 84 BPM, Cinematic Ambient Flow 70 BPM*).
  - Upload custom MP3 / WAV background music with synchronized preview.

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

## 🎬 Architecture

```
+--------------------------------------------------------------------+
|                         Reel Creator Studio                        |
|                                                                    |
|  [Media Library]           [Phone Canvas HUD]       [Inspector]   |
|  - Upload Video/Photo/MP3  - 9:16 Realtime Player   - Ken Burns   |
|  - Free Stock Assets       - Ken Burns Motion       - Film Grade  |
|  - Viral Caption Hooks     - Aesthetic Overlays     - Transitions |
|  - Synth Audio Beats       - Text Overlay Render    - Font/Styles |
|                                                                    |
|  ----------------------------------------------------------------  |
|  [Multi-Track Timeline]                                            |
|  - Track 1: Text Layers with In/Out Timing                         |
|  - Track 2: Photo & Video Clips with Duration Resize & Reordering  |
|  - Track 3: Audio Soundtrack Track with BPM Indicator              |
|  - Scrubbable Playhead Tracker (0.0s -> Total)                     |
|                                                                    |
|  ----------------------------------------------------------------  |
|  [Canvas Exporter] -> MediaRecorder -> Downloadable Video File     |
+--------------------------------------------------------------------+
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
