import React from "react";
import useGlobalVar from "@/services/GlobalVar";
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

  return (
    <>
      {Object.entries(trainLocations).map(([stationKey, location]) => (
        <StationPin
          key={stationKey}
          stationKey={stationKey}
          location={location}
          selected={selectedStation === stationKey}
          disabled={disabledStations.includes(stationKey)}
          onClick={onStationClick}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
