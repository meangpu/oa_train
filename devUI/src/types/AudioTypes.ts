export interface AudioConfig {
    poolSize?: number;
    volume?: number;
    minPitch?: number;
    maxPitch?: number;
}

export interface AudioFileConfig extends AudioConfig {
    audioFile: string;
}

export interface AudioManagerConfig extends AudioConfig {
    defaultPoolSize?: number;
    defaultVolume?: number;
    defaultMinPitch?: number;
    defaultMaxPitch?: number;
}
