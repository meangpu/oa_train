import AudioPlayer from "@/components/AudioPlayer";
import { AudioConfig, AudioManagerConfig } from "@/types/AudioTypes";

class AudioManager {
  #audioPlayers: Map<string, AudioPlayer> = new Map();
  #defaultConfig: Required<AudioConfig>;
  #audioEnabled: boolean = true;
  constructor(config: AudioManagerConfig = {}) {
    this.#defaultConfig = {
      poolSize: config.defaultPoolSize ?? 3,
      volume: config.defaultVolume ?? 1.0,
      minPitch: config.defaultMinPitch ?? 0.8,
      maxPitch: config.defaultMaxPitch ?? 1.2,
    };
  }
  getAudioPlayer(audioFile: string, config?: AudioConfig): AudioPlayer {
    if (!this.#audioPlayers.has(audioFile)) {
      const playerConfig = {
        audioFile,
        ...this.#defaultConfig,
        ...config,
      };

      this.#audioPlayers.set(audioFile, new AudioPlayer(playerConfig));
    }

    return this.#audioPlayers.get(audioFile)!;
  }

  async playAudio(audioFile: string, config?: AudioConfig): Promise<void> {
    // Skip playing if audio is disabled
    if (!this.#audioEnabled) {
      return;
    }

    // If pitch config is provided, ensure player has correct pitch before playing
    // Update pitch range first if config specifies it
    if (config?.minPitch !== undefined || config?.maxPitch !== undefined) {
      const minPitch = config.minPitch ?? this.#defaultConfig.minPitch;
      const maxPitch = config.maxPitch ?? this.#defaultConfig.maxPitch;
      
      // If player exists, update its pitch range
      const existingPlayer = this.#audioPlayers.get(audioFile);
      if (existingPlayer) {
        existingPlayer.setPitchRange(minPitch, maxPitch);
      }
      
      // Get or create player with updated pitch config
      const player = this.getAudioPlayer(audioFile, {
        ...config,
        minPitch,
        maxPitch,
      });
      
      // Ensure pitch is set (in case player was just created)
      player.setPitchRange(minPitch, maxPitch);
      
      await player.playSound();
    } else {
      // No pitch config, use normal flow
      const player = this.getAudioPlayer(audioFile, config);
      await player.playSound();
    }
  }

  preloadAudio(audioFile: string, config?: AudioConfig): AudioPlayer {
    return this.getAudioPlayer(audioFile, config);
  }
  setVolume(audioFile: string, volume: number): void {
    const player = this.#audioPlayers.get(audioFile);
    if (player) {
      player.setVolume(volume);
    }
  }

  setGlobalVolume(volume: number): void {
    this.#audioPlayers.forEach((player) => {
      player.setVolume(volume);
    });
  }

  setPitchRange(audioFile: string, minPitch: number, maxPitch: number): void {
    const player = this.#audioPlayers.get(audioFile);
    if (player) {
      player.setPitchRange(minPitch, maxPitch);
    }
  }

  setGlobalPitchRange(minPitch: number, maxPitch: number): void {
    this.#audioPlayers.forEach((player) => {
      player.setPitchRange(minPitch, maxPitch);
    });
  }

  removeAudio(audioFile: string): void {
    const player = this.#audioPlayers.get(audioFile);
    if (player) {
      player.destroy();
      this.#audioPlayers.delete(audioFile);
    }
  }

  getLoadedAudioFiles(): string[] {
    return Array.from(this.#audioPlayers.keys());
  }

  isAudioLoaded(audioFile: string): boolean {
    return this.#audioPlayers.has(audioFile);
  }

  enableAudio(): void {
    this.#audioPlayers.forEach((player) => {
      player.enableAudio();
    });
  }

  isAudioEnabled(): boolean {
    return Array.from(this.#audioPlayers.values()).some((player) =>
      player.isAudioEnabled()
    );
  }

  destroy(): void {
    this.#audioPlayers.forEach((player) => {
      player.destroy();
    });
    this.#audioPlayers.clear();
  }

  updateDefaultConfig(config: Partial<AudioConfig>): void {
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...config,
    };
  }

  stopAllAudio(): void {
    this.#audioPlayers.forEach((player) => {
      player.stop();
    });
  }

  setAudioSystemEnabled(enabled: boolean): void {
    this.#audioEnabled = enabled;
  }

  isAudioSystemEnabled(): boolean {
    return this.#audioEnabled;
  }
}

export default AudioManager;
