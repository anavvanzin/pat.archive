import { Howl, Howler } from 'howler';

class PixelAudioEngine {
  private music: Howl | null = null;
  private blip: Howl | null = null;
  private analyser: AnalyserNode | null = null;
  private playlist: string[] = [];
  private currentTrackIndex: number = 0;
  private unlocked: boolean = false;
  public pixelLoveTrackDuration: number = 0;

  constructor() {
    this.blip = new Howl({
      src: ['/audio/blip.mp3'],
      volume: 0.5,
    });
    this.initAnalyser();
  }

  private initAnalyser() {
    if (Howler.ctx) {
      this.analyser = Howler.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      Howler.masterGain.connect(this.analyser);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser && Howler.ctx) {
      this.initAnalyser();
    }
    return this.analyser;
  }

  public setPlaylist(urls: string[]) {
    this.playlist = urls;
    this.currentTrackIndex = 0;
    this.loadCurrentTrack();
  }

  private loadCurrentTrack() {
    if (this.playlist.length === 0) return;
    
    if (this.music) {
      this.music.unload();
    }

    this.music = new Howl({
      src: [this.playlist[this.currentTrackIndex]],
      html5: true,
      loop: true,
      onload: () => {
        this.pixelLoveTrackDuration = this.music?.duration() || 0;
      },
    });
  }

  public playMusic() {
    if (!this.music) return;
    this.music.play();
  }

  public pauseMusic() {
    this.music?.pause();
  }

  public resumeMusic() {
    this.music?.play();
  }

  public setVolume(volume: number) {
    Howler.volume(volume);
  }

  public primeFromGesture() {
    this.unlocked = true;
  }

  public playBlip() {
    this.blip?.play();
  }

  public getMusicPosition(): number {
    return this.music ? (this.music.seek() as number) : 0;
  }

  public getMusicDuration(): number {
    return this.pixelLoveTrackDuration;
  }

  public hasUnlockedAudio(): boolean {
    return this.unlocked;
  }

  public seekMusic(time: number) {
    this.music?.seek(time);
  }

  public nextTrack() {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadCurrentTrack();
    this.playMusic();
  }

  public prevTrack() {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrentTrack();
    this.playMusic();
  }
}

export const pixelLoveAudio = new PixelAudioEngine();
