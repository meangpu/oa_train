import React, { useCallback, useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrain } from "react-icons/fa";
import { gameToLeafletStatic } from "@/components/meRedMCoord/mapCoords";
import {
  Coord3,
  distanceBetweenCoords,
  formatDistanceText,
  formatTrainStationLabel,
  formatTravelCostText,
  formatWaitTimeText,
  isValidCoord3,
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
  onHoverStart?: (stationKey: string) => void;
  onHoverEnd?: () => void;
}

const PIN_GREEN = "#37c2af";

const PIN_HIT_SIZE = 44;
const PIN_VISUAL_SIZE = 22;

const createTrainPinIcon = (
  label: string,
  selected = false,
  disabled = false,
  isPlayerHere = false,
) => {
  const color = disabled
    ? "#6b6b6b"
    : isPlayerHere
      ? PIN_GREEN
      : selected
        ? "#ffffff"
        : "#ffffff";
  const iconMarkup = renderToStaticMarkup(
    <div
      className='train-pin-hit flex items-center justify-center'
      style={{ width: PIN_HIT_SIZE, height: PIN_HIT_SIZE }}
      role='button'
      aria-label={label}
    >
      <div className='train-pin-inner relative w-[22px] h-[22px] pointer-events-none'>
        <div
          className='text-[8px] absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 rounded '
          style={{
            color,
          }}
        >
          {label.toUpperCase()}
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
            คุณอยู่ที่นี่{" "}
          </div>
        ) : null}
      </div>
    </div>,
  );

  const anchorY = PIN_HIT_SIZE / 2 + (isPlayerHere ? 3 : 0);

  return L.divIcon({
    html: iconMarkup,
    className: `train-pin-icon${disabled ? " train-pin-disabled" : ""}`,
    iconSize: [PIN_HIT_SIZE, PIN_HIT_SIZE],
    iconAnchor: [PIN_HIT_SIZE / 2, anchorY],
    popupAnchor: [0, -PIN_VISUAL_SIZE / 2],
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
  onHoverStart,
  onHoverEnd,
}) => {
  const label = formatTrainStationLabel(stationKey);
  const icon = useMemo(
    () => createTrainPinIcon(label, selected, disabled, isPlayerHere),
    [label, selected, disabled, isPlayerHere],
  );
  const tooltipContent = useMemo(() => {
    if (!currentStationLocation) return null;
    if (isPlayerHere) return "คุณอยู่ที่นี่";

    if (
      !isValidCoord3(currentStationLocation) ||
      !isValidCoord3(location.npcLocation)
    ) {
      return null;
    }

    const distance = distanceBetweenCoords(
      currentStationLocation,
      location.npcLocation,
    );
    const distanceText = formatDistanceText(distance);
    const travelCostText = formatTravelCostText(distance);
    const waitTimeText = formatWaitTimeText(distance);
    const distanceLine = currentStationLabel
      ? `ระยะ ${distanceText}`
      : distanceText;

    return (
      <div className='flex flex-col items-center gap-0.5 leading-tight'>
        <span>{distanceLine}</span>
        <span>{travelCostText}</span>
        <span>{waitTimeText}</span>
      </div>
    );
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

  const handleMouseOver = useCallback(() => {
    onHoverStart?.(stationKey);
  }, [onHoverStart, stationKey]);

  const handleMouseOut = useCallback(() => {
    onHoverEnd?.();
  }, [onHoverEnd]);

  const eventHandlers = useMemo(
    () => ({
      click: handleClick,
      mouseover: handleMouseOver,
      mouseout: handleMouseOut,
    }),
    [handleClick, handleMouseOver, handleMouseOut],
  );

  if (
    x === undefined ||
    y === undefined ||
    Number.isNaN(x) ||
    Number.isNaN(y)
  ) {
    return null;
  }

  return (
    <Marker
      position={gameToLeafletStatic(x, y)}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      {tooltipContent ? (
        <Tooltip
          direction='top'
          offset={[0, -34]}
          opacity={1}
          interactive
          className='train-pin-tooltip'
        >
          {tooltipContent}
        </Tooltip>
      ) : null}
    </Marker>
  );
};

export default React.memo(StationPin);
