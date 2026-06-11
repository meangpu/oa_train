import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import { gameToLeaflet } from "@/components/meRedMCoord/mapCoords";
import { TrainStationLocation } from "@/types/TrainConfig";
import { createTrainPinIcon } from "./createTrainPinIcon";
import { formatStationLabel } from "./formatStationLabel";

export interface TrainPinProps {
  stationKey: string;
  location: TrainStationLocation;
  selected?: boolean;
  onSelect?: (stationKey: string) => void;
}

const TrainPin: React.FC<TrainPinProps> = ({
  stationKey,
  location,
  selected = false,
  onSelect,
}) => {
  const label = formatStationLabel(stationKey);
  const icon = useMemo(
    () => createTrainPinIcon(label, selected),
    [label, selected]
  );
  const { x, y } = location.npcLocation;

  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
    return null;
  }

  return (
    <Marker
      position={gameToLeaflet(x, y)}
      icon={icon}
      eventHandlers={{
        click: () => onSelect?.(stationKey),
      }}
    />
  );
};

export default React.memo(TrainPin);
