import React, { useMemo } from "react";
import useGlobalVar from "@/services/GlobalVar";
import {
  findClosestStationKey,
  formatTrainStationLabel,
} from "@/services/Utils";
import StationPin, { StationPinContext } from "./StationPin";

export interface TrainPinsProps {
  selectedStation?: string | null;
  disabledStations?: string[];
  onStationClick?: (context: StationPinContext) => void;
}

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

  const currentStationLocation = closestStationKey
    ? trainLocations[closestStationKey]?.npcLocation
    : null;
  const currentStationLabel = closestStationKey
    ? formatTrainStationLabel(closestStationKey)
    : null;

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
          currentStationLocation={currentStationLocation}
          currentStationLabel={currentStationLabel}
          onClick={onStationClick}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
