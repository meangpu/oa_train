import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrain } from "react-icons/fa";
import { gameToLeaflet } from "@/components/meRedMCoord/mapCoords";
import useGlobalVar from "@/services/GlobalVar";
import { TrainStationLocation } from "@/types/TrainConfig";

const formatStationLabel = (stationKey: string) =>
  stationKey
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const createTrainPinIcon = (label: string, selected = false) => {
  const color = selected ? "#f5c542" : "#e8d4a8";
  const iconMarkup = renderToStaticMarkup(
    <div className='relative w-[22px] h-[22px]'>
      <div
        className='text-[8px] absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 rounded'
        style={{
          color,
          textShadow: "0 0 3px rgba(0,0,0,0.9)",
        }}
      >
        {label}
      </div>
      <FaTrain
        style={{
          color,
          fontSize: "18px",
          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))",
        }}
      />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "train-pin-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

interface StationPinProps {
  stationKey: string;
  location: TrainStationLocation;
  selected: boolean;
  onSelect?: (stationKey: string) => void;
}

const StationPin: React.FC<StationPinProps> = ({
  stationKey,
  location,
  selected,
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
        <StationPin
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
