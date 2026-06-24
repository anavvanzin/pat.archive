/**
 * CHDX AudioEngine — Howler.js singleton for inline set playback
 * Provides playlist-aware streaming, play/pause/next/prev, and UI event hooks.
 * Loads before the page script so it's available at init time.
 */
(function () {
  'use strict';

  class AudioEngine {
    constructor() {
      if (AudioEngine._instance) return AudioEngine._instance;
      AudioEngine._instance = this;

      this.playlist = [];
      this.currentIdx = -1;
      this._howl = null;
      this._isPlaying = false;
      this._volume = 0.8;
      this._loop = false;

      // Listeners: { event: [fn, ...] }
      this._listeners = {};
    }

    /* ---------- playlist ---------- */

    load(sets) {
      this.playlist = sets.map(s => ({
        id: s.n || s.id,
        title: s.title,
        artist: s.genre || 'CHDX',
        duration: s.duration || '',
        cover: s.cover || '',
        url: s.url || null,
        live: s.live || false,
      }));
      this.currentIdx = -1;
      this._unload();
    }

    /* ---------- playback ---------- */

    play(idx) {
      if (idx != null) {
        if (idx < 0 || idx >= this.playlist.length) return;
        if (idx === this.currentIdx && this._howl) {
          this._resume();
          return;
        }
        this.currentIdx = idx;
        this._loadAndPlay(idx);
      } else if (this._howl) {
        this._resume();
      }
    }

    pause() {
      if (this._howl && this._isPlaying) {
        this._howl.pause();
        this._isPlaying = false;
        this._emit('change', this._state());
      }
    }

    toggle() {
      if (this._isPlaying) this.pause();
      else this.play();
    }

    next() {
      if (this.playlist.length === 0) return;
      const idx = (this.currentIdx + 1) % this.playlist.length;
      this.play(idx);
    }

    prev() {
      if (this.playlist.length === 0) return;
      const idx = this.currentIdx <= 0 ? this.playlist.length - 1 : this.currentIdx - 1;
      this.play(idx);
    }

    seek(frac) {
      if (!this._howl) return;
      const dur = this._howl.duration();
      this._howl.seek(dur * Math.max(0, Math.min(1, frac)));
    }

    setLoop(v) { this._loop = !!v; if (this._howl) this._howl.loop(this._loop); }
    getLoop() { return this._loop; }

    setVolume(v) {
      this._volume = Math.max(0, Math.min(1, v));
      if (this._howl) this._howl.volume(this._volume);
    }
    getVolume() { return this._volume; }

    getProgress() {
      if (!this._howl || !this._isPlaying) return 0;
      const dur = this._howl.duration();
      if (!dur) return 0;
      return this._howl.seek() / dur;
    }

    getCurrent() {
      if (this.currentIdx < 0 || !this.playlist[this.currentIdx]) return null;
      return {
        ...this.playlist[this.currentIdx],
        index: this.currentIdx,
      };
    }

    /* ---------- events ---------- */

    on(event, fn) {
      (this._listeners[event] = this._listeners[event] || []).push(fn);
    }

    off(event, fn) {
      const fns = this._listeners[event];
      if (!fns) return;
      this._listeners[event] = fns.filter(f => f !== fn);
    }

    /* ---------- internals ---------- */

    _unload() {
      if (this._howl) {
        this._howl.unload();
        this._howl = null;
      }
      this._isPlaying = false;
    }

    _resume() {
      if (!this._howl) return;
      if (this._howl.state() === 'unloaded') {
        this._loadAndPlay(this.currentIdx);
        return;
      }
      this._howl.play();
      this._isPlaying = true;
      this._emit('change', this._state());
    }

    _loadAndPlay(idx) {
      const track = this.playlist[idx];
      if (!track || !track.url) return;

      this._unload();
      this._emit('loading', { index: idx, track });

      // Use CORS proxy for external URLs
      const isSameOrigin = track.url.startsWith('blob:') || track.url.startsWith('/') || track.url.startsWith(location.origin);
      const src = isSameOrigin ? track.url : `/api/audio-proxy?url=${encodeURIComponent(track.url)}`;

      this._howl = new Howl({
        src: [src],
        html5: true,             // stream (don't buffer entire file)
        volume: this._volume,
        loop: this._loop,
        onload: () => {
          this._howl.play();
          this._isPlaying = true;
          this._emit('change', this._state());
          this._emit('loaded', this._state());
        },
        onplay: () => {
          this._isPlaying = true;
          this._emit('change', this._state());
        },
        onpause: () => {
          this._isPlaying = false;
          this._emit('change', this._state());
        },
        onend: () => {
          this._isPlaying = false;
          if (this._loop) return;
          this.next();
        },
        onloaderror: (_, errCode) => {
          console.error('Howler load error:', errCode);
          this._isPlaying = false;
          this._emit('error', { index: idx, track, code: errCode });
          this._emit('change', this._state());
        },
        onplayerror: () => {
          console.error('Howler play error');
          this._isPlaying = false;
          this._emit('error', { index: idx, track });
          this._emit('change', this._state());
        },
      });
    }

    _state() {
      return {
        isPlaying: this._isPlaying,
        currentIdx: this.currentIdx,
        current: this.getCurrent(),
        progress: this.getProgress(),
        playlist: this.playlist,
        loop: this._loop,
        volume: this._volume,
      };
    }

    _emit(event, data) {
      (this._listeners[event] || []).forEach(fn => fn(data));
    }
  }

  window.CHDX = window.CHDX || {};
  window.CHDX.AudioEngine = new AudioEngine();
})();
