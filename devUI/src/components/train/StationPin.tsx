import React, { useCallback, useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrain } from "react-icons/fa";
import { gameToLeaflet } from "@/components/meRedMCoord/mapCoords";
import {
  Coord3,
  distanceBetweenCoordsText,
  formatTrainStationLabel,
} from "@/services/Utils";
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
  isPlayerHere?: boolean;
  currentStationLocation?: Coord3 | null;
  currentStationLabel?: string | null;
  onClick?: (context: StationPinContext) => void;
}

const PIN_GREEN = "#37c2af";

const createTrainPinIcon = (
  label: string,
  selected = false,
  disabled = false,
  isPlayerHere = false
) => {
  const color = disabled
    ? "#6b6b6b"
    : isPlayerHere
      ? PIN_GREEN
      : selected
        ? "#f5c542"
        : "#e8d4a8";
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
      {isPlayerHere ? (
        <div
          className='text-[8px] absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap'
          style={{
            color: PIN_GREEN,
            textShadow: "0 0 3px rgba(0,0,0,0.9)",
          }}
        >
          คุณอยู่นี่
        </div>
      ) : null}
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "train-pin-icon",
    iconSize: [22, 22],
    iconAnchor: [11, isPlayerHere ? 14 : 11],
    popupAnchor: [0, -11],
  });
};

const StationPin: React.FC<StationPinProps> = ({
  stationKey,
  location,
  selected = false,
  disabled = false,
  isPlayerHere = false,
  currentStationLocation = null,
  currentStationLabel = null,
  onClick,
}) => {
  const label = formatTrainStationLabel(stationKey);
  const icon = useMemo(
    () => createTrainPinIcon(label, selected, disabled, isPlayerHere),
    [label, selected, disabled, isPlayerHere]
  );
  const tooltipText = useMemo(() => {
    if (!currentStationLocation) return null;
    if (isPlayerHere) return "คุณอยู่ที่นี่";
    const distanceText = distanceBetweenCoordsText(
      currentStationLocation,
      location.npcLocation
    );
    if (!distanceText) return null;
    return currentStationLabel
      ? `${distanceText} จาก ${currentStationLabel}`
      : distanceText;
  }, [
    currentStationLocation,
    currentStationLabel,
    isPlayerHere,
    location.npcLocation,
  ]);
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
    >
      {tooltipText ? (
        <Tooltip
          direction='top'
          offset={[0, -18]}
          opacity={1}
          className='train-pin-tooltip'
        >
          {tooltipText}
        </Tooltip>
      ) : null}
    </Marker>
  );
};

export default React.memo(StationPin);
