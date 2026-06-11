export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface TrainStationLocation {
  npcLocation: Vector4;
  exitLocation: Vector4;
}

export type TrainLocations = Record<string, TrainStationLocation>;
