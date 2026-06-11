import React, { useMemo } from "react";
import useGlobalVar from "@/services/GlobalVar";
import StationPin, { StationPinContext } from "./StationPin";

export interface TrainPinsProps {
  selectedStation?: string | null;
  disabledStations?: string[];
  onStationClick?: (context: StationPinContext) => void;
}

const findClosestStationKey = (
  playerLocation: { x: number; y: number; z: number },
  trainLocations: Record<string, { npcLocation: { x: number; y: number; z: number } }>
) => {
  const { x, y, z } = playerLocation;
  if (
    x === undefined ||
    y === undefined ||
    Number.isNaN(x) ||
    Number.isNaN(y)
  ) {
    return null;
  }

  let closestKey: string | null = null;
  let minDistSq = Infinity;

  for (const [stationKey, location] of Object.entries(trainLocations)) {
    const { x: sx, y: sy, z: sz } = location.npcLocation;
    if (sx === undefined || sy === undefined || Number.isNaN(sx) || Number.isNaN(sy)) {
      continue;
    }
    const dx = x - sx;
    const dy = y - sy;
    const dz = z - (sz ?? 0);
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closestKey = stationKey;
    }
  }

  return closestKey;
};

const TrainPins: React.FC<TrainPinsProps> = ({
  selectedStation = null,
  disabledStations = [],
  onStationClick,
}) => {
  const trainLocations = useGlobalVar((state) => state.trainLocations);
  const playerLocation = useGlobalVar((state) => state.playerLocation);

  const closestStationKey = useMemo(
    () => findClosestStationKey(playerLocation, trainLocations),
    [playerLocation, trainLocations]
  );

  return (
    <>
      {Object.entries(trainLocations).map(([stationKey, location]) => (
        <StationPin
          key={stationKey}
          stationKey={stationKey}
          location={location}
          selected={selectedStation === stationKey}
          disabled={disabledStations.includes(stationKey)}
          isPlayerHere={closestStationKey === stationKey}
          onClick={onStationClick}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
