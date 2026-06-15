# Audio Engine Overhaul Design Spec

## 1. Overview
Overhaul the audio system to use Howler.js, enabling robust remote audio playback, playlist management, and track looping. Replace legacy "PLAY" text controls with an interactive icon-based UI.

## 2. Architecture
### 2.1 Audio Engine (`src/audio/pixelLoveAudio.ts`)
- **Class**: `PixelAudioEngine` (Singleton pattern).
- **Features**:
  - **Playlist**: `Array<string>` storing audio URLs.
  - **Looping**: Boolean toggle for native Howler looping.
  - **Methods**: `load(url)`, `play()`, `pause()`, `next()`, `prev()`, `seek(time)`, `setLoop(bool)`.
  - **Events**: Emits `onLoad`, `onPlay`, `onPause`, `onEnd`, `onError`.

### 2.2 UI/Frontend (`src/components/SpotifyPlayer.tsx`)
- **Button Overhaul**: Remove "PLAY"/"PAUSE" text. Replace with standard icon-based symbols (SVG/Lucide icons) with animated transitions.
- **Playlist UI**: Add skip/back controls bound to `next()` and `prev()`.
- **Responsive Feedback**: Update UI state based on engine events (loading, error, playback).

## 3. Parallel Implementation Plan
- **Agent A**: Develop `PixelAudioEngine` and unit tests.
- **Agent B**: Develop `SpotifyPlayer` component and Zustand store updates.

## 4. Success Criteria
- [ ] Tracks load reliably from remote URLs.
- [ ] Playlists navigate forward/backward correctly.
- [ ] Looping toggle functions as expected.
- [ ] Icon-based UI replaces text-based play button.
- [ ] No regression in core playback stability.
