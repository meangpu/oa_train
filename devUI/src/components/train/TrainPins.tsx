import React from "react";
import useGlobalVar from "@/services/GlobalVar";
import TrainPin from "./TrainPin";

export interface TrainPinsProps {
  selectedStation?: string | null;
  onSelectStation?: (stationKey: string) => void;
}

const TrainPins: React.FC<TrainPinsProps> = ({
  selectedStation = null,
  onSelectStation,
}) => {
  const trainLocations = useGlobalVar((state) => state.trainLocations);

  return (
    <>
      {Object.entries(trainLocations).map(([stationKey, location]) => (
        <TrainPin
          key={stationKey}
          stationKey={stationKey}
          location={location}
          selected={selectedStation === stationKey}
          onSelect={onSelectStation}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
