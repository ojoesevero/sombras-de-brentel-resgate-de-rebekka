import Phaser from 'phaser';

export interface AudioPlayOptions {
  loop?: boolean;
  volume?: number;
}

/**
 * Serviço desacoplado de áudio em TypeScript.
 */
export class AudioService {
  public bgmVolume: number = 1.0;
  public sfxVolume: number = 1.0;
  public currentBgmKey: string | null = null;
  public currentSound: Phaser.Sound.BaseSound | null = null;
  public scene: Phaser.Scene | null = null;

  public attach(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  public playBgm(key: string, options: AudioPlayOptions = {}): void {
    this.currentBgmKey = key;
    if (!this.scene || !this.scene.sound) return;

    try {
      if (this.currentSound) {
        this.currentSound.stop();
      }
      if (this.scene.sound.get(key)) {
        this.currentSound = this.scene.sound.add(key, {
          loop: options.loop !== false,
          volume: this.bgmVolume
        });
        this.currentSound.play();
      }
    } catch (err) {
      console.warn(`[AudioService] Não foi possível reproduzir BGM '${key}':`, err);
    }
  }

  public stopBgm(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound = null;
    }
    this.currentBgmKey = null;
  }

  public playSfx(key: string, options: AudioPlayOptions = {}): void {
    if (!this.scene || !this.scene.sound) return;
    try {
      if (this.scene.sound.get(key)) {
        this.scene.sound.play(key, {
          volume: options.volume !== undefined ? options.volume : this.sfxVolume
        });
      }
    } catch (err) {
      console.warn(`[AudioService] Não foi possível reproduzir SFX '${key}':`, err);
    }
  }

  public setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.currentSound && 'setVolume' in this.currentSound) {
      (this.currentSound as Phaser.Sound.WebAudioSound).setVolume(this.bgmVolume);
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
}

export const globalAudioService = new AudioService();
