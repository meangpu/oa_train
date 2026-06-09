import { getRandomValue } from "@/services/Utils";

class AudioPlayer {
  #audioPool: HTMLAudioElement[] = [];
  #currentIndex: number = 0;
  #audioFile: string | undefined;
  #poolSize: number;
  #volume: number;
  #minPitch: number;
  #maxPitch: number;
  #audioContext: AudioContext | null = null;
  #audioBuffer: AudioBuffer | null = null;
  #userInteracted: boolean = false;

  constructor({
    audioFile,
    poolSize = 3,
    volume = 1.0,
    minPitch = 0.8,
    maxPitch = 1.2,
  }: {
    audioFile?: string;
    poolSize?: number;
    volume?: number;
    minPitch?: number;
    maxPitch?: number;
  } = {}) {
    this.#audioFile = audioFile;
    this.#poolSize = poolSize;
    this.#volume = Math.max(0, Math.min(1, volume));
    this.#minPitch = minPitch;
    this.#maxPitch = maxPitch;
    this.#initializePool();
    this.#setupEventListeners();
    this.#initializeWebAudio();
  }

  #setupEventListeners() {
    // Listen for user interaction to enable audio
    const enableAudio = () => {
      this.#userInteracted = true;
      this.#resumeAudioContext();

      // Remove listeners after first interaction
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("keydown", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("keydown", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.#resumeAudioContext();
      }
    });

    // Handle window focus
    window.addEventListener("focus", () => {
      this.#resumeAudioContext();
    });
  }

  async #initializeWebAudio() {
    try {
      // Create Web Audio API context
      this.#audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      // Load audio file into buffer for Web Audio API
      if (this.#audioFile) {
        await this.#loadAudioBuffer();
      }
    } catch {
      // console.log("Web Audio API not available, falling back to HTML5 Audio");
    }
  }

  async #loadAudioBuffer() {
    if (!this.#audioContext || !this.#audioFile) return;

    try {
      const response = await fetch(this.#audioFile);
      const arrayBuffer = await response.arrayBuffer();
      this.#audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);
    } catch {
      console.log("Failed to load audio buffer");
    }
  }

  #resumeAudioContext() {
    if (this.#audioContext && this.#audioContext.state === "suspended") {
      this.#audioContext.resume().catch(console.error);
    }
  }

  #initializePool() {
    if (!this.#audioFile) {
      this.#audioPool = [];
      return;
    }

    this.#audioPool = Array(this.#poolSize)
      .fill(null)
      .map(() => {
        const audio = new Audio(this.#audioFile);
        audio.preload = "auto";
        audio.volume = this.#volume;

        // Set audio attributes to help with autoplay
        audio.setAttribute("playsinline", "");
        audio.setAttribute("webkit-playsinline", "");

        // Enable cross-origin for better compatibility
        audio.crossOrigin = "anonymous";

        return audio;
      });
  }

  async playSound() {
    if (!this.#audioFile || this.#audioPool.length === 0) return;

    const audio = this.#audioPool[this.#currentIndex];

    try {
      // Reset audio state
      audio.pause();
      audio.currentTime = 0;

      // Set pitch
      const randomPitch = getRandomValue(this.#minPitch, this.#maxPitch);
      audio.playbackRate = randomPitch;

      // Try multiple strategies to play audio
      await this.#playWithAllStrategies(audio);

      // Move to next audio in pool
      this.#currentIndex = (this.#currentIndex + 1) % this.#audioPool.length;
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  }

  async #playWithAllStrategies(audio: HTMLAudioElement): Promise<void> {
    // Strategy 1: Try Web Audio API first (works better in background)
    if (await this.#tryWebAudioPlayback()) {
      return;
    }

    // Strategy 2: Try HTML5 Audio with multiple approaches
    if (await this.#tryHTML5AudioPlayback(audio)) {
      return;
    }

    // Strategy 3: Force play with user interaction simulation
    await this.#forcePlayWithInteraction(audio);
  }

  async #tryWebAudioPlayback(): Promise<boolean> {
    if (!this.#audioContext || !this.#audioBuffer) return false;

    try {
      // Resume context if suspended
      if (this.#audioContext.state === "suspended") {
        await this.#audioContext.resume();
      }

      // Create source and play
      const source = this.#audioContext.createBufferSource();
      const gainNode = this.#audioContext.createGain();

      source.buffer = this.#audioBuffer;
      source.playbackRate.value = getRandomValue(
        this.#minPitch,
        this.#maxPitch
      );

      gainNode.gain.value = this.#volume;

      source.connect(gainNode);
      gainNode.connect(this.#audioContext.destination);

      source.start(0);

      // console.log("Audio played via Web Audio API");
      return true;
    } catch (error) {
      console.log("Web Audio API playback failed:", error);
      return false;
    }
  }

  async #tryHTML5AudioPlayback(audio: HTMLAudioElement): Promise<boolean> {
    try {
      // Try direct play
      await audio.play();
      // console.log("Audio played via HTML5 Audio");
      return true;
    } catch {
      // console.log("Direct HTML5 Audio play failed, trying alternatives...");
    }

    try {
      // Try with muted first, then unmute (common workaround)
      audio.muted = true;
      await audio.play();
      audio.muted = false;
      // console.log("Audio played via muted-unmuted strategy");
      return true;
    } catch {
      // console.log("Muted-unmuted strategy failed");
    }

    try {
      // Try with volume 0 first, then restore volume
      const originalVolume = audio.volume;
      audio.volume = 0;
      await audio.play();
      audio.volume = originalVolume;
      // console.log("Audio played via volume 0 strategy");
      return true;
    } catch {
      // console.log("Volume 0 strategy failed");
    }

    return false;
  }

  async #forcePlayWithInteraction(audio: HTMLAudioElement): Promise<void> {
    try {
      // Create a hidden button and trigger click programmatically
      const tempButton = document.createElement("button");
      tempButton.style.position = "absolute";
      tempButton.style.left = "-9999px";
      tempButton.style.top = "-9999px";
      tempButton.style.opacity = "0";
      tempButton.style.pointerEvents = "none";
      tempButton.textContent = "Play Audio";

      // Add event listener to the button
      tempButton.addEventListener("click", async () => {
        try {
          await audio.play();
          // console.log("Audio played via forced interaction");
        } catch (finalError) {
          console.error("All audio playback strategies failed:", finalError);
        }
      });

      // Add button to DOM and trigger click
      document.body.appendChild(tempButton);
      tempButton.click();

      // Remove button after a short delay
      setTimeout(() => {
        if (document.body.contains(tempButton)) {
          document.body.removeChild(tempButton);
        }
      }, 100);
    } catch {
      console.error("Forced interaction failed");
    }
  }

  destroy() {
    this.#audioPool.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.#audioPool = [];

    if (this.#audioContext) {
      this.#audioContext.close();
      this.#audioContext = null;
    }

    this.#audioBuffer = null;
  }

  setVolume(volume: number) {
    this.#volume = Math.max(0, Math.min(1, volume));
    this.#audioPool.forEach((audio) => {
      audio.volume = this.#volume;
    });
  }

  setAudioFile(audioFile: string) {
    this.#audioFile = audioFile;
    this.destroy();
    this.#initializePool();
    this.#initializeWebAudio();
  }

  setPitchRange(minPitch: number, maxPitch: number) {
    this.#minPitch = minPitch;
    this.#maxPitch = maxPitch;
  }

  // Method to manually enable audio (useful for testing)
  enableAudio() {
    this.#userInteracted = true;
    this.#resumeAudioContext();
  }

  // Check if audio is enabled
  isAudioEnabled(): boolean {
    return this.#userInteracted;
  }

  // Stop all currently playing audio without destroying the player
  stop(): void {
    this.#audioPool.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

export default AudioPlayer;
