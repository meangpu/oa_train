import React, { useCallback, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrain } from "react-icons/fa";
import { gameToLeaflet } from "@/components/meRedMCoord/mapCoords";
import { TrainStationLocation } from "@/types/TrainConfig";

export interface StationPinContext {
  stationKey: string;
  label: string;
  location: TrainStationLocation;
}

export interface StationPinProps {
  stationKey: string;
  location: TrainStationLocation;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (context: StationPinContext) => void;
}

const formatStationLabel = (stationKey: string) =>
  stationKey
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const createTrainPinIcon = (
  label: string,
  selected = false,
  disabled = false
) => {
  const color = disabled ? "#6b6b6b" : selected ? "#f5c542" : "#e8d4a8";
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
          opacity: disabled ? 0.6 : 1,
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

const StationPin: React.FC<StationPinProps> = ({
  stationKey,
  location,
  selected = false,
  disabled = false,
  onClick,
}) => {
  const label = formatStationLabel(stationKey);
  const icon = useMemo(
    () => createTrainPinIcon(label, selected, disabled),
    [label, selected, disabled]
  );
  const { x, y } = location.npcLocation;

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.({ stationKey, label, location });
  }, [disabled, onClick, stationKey, label, location]);

  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
    return null;
  }

  return (
    <Marker
      position={gameToLeaflet(x, y)}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
};

export default React.memo(StationPin);
