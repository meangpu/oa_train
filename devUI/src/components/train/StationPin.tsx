import React, { useCallback, useMemo } from "react";
import { FaTrain } from "react-icons/fa";
import { gameToStaticMapPixel } from "@/components/meRedMCoord/mapCoords";
import { useStaticTrainMapScale } from "@/components/train/StaticTrainMap";
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
  const color = disabled
    ? "#6b6b6b"
    : isPlayerHere
      ? PIN_GREEN
      : selected
        ? "#ffffff"
        : "#ffffff";

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
  const mapScale = useStaticTrainMapScale();
  const pinScreenScale = 1 / mapScale;

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.({ stationKey, label, location });
  }, [disabled, onClick, stationKey, label, location]);

  const handleMouseEnter = useCallback(() => {
    onHoverStart?.(stationKey);
  }, [onHoverStart, stationKey]);

  const handleMouseLeave = useCallback(() => {
    onHoverEnd?.();
  }, [onHoverEnd]);

  if (
    x === undefined ||
    y === undefined ||
    Number.isNaN(x) ||
    Number.isNaN(y)
  ) {
    return null;
  }

  const position = gameToStaticMapPixel(x, y);

  return (
    <div
      className={`train-pin absolute${disabled ? " train-pin-disabled" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${pinScreenScale})`,
      }}
      role='button'
      aria-label={label}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className='train-pin-hit flex items-center justify-center'
        style={{ width: PIN_HIT_SIZE, height: PIN_HIT_SIZE }}
      >
        <div className='train-pin-inner relative w-[22px] h-[22px] pointer-events-none'>
          <div
            className='text-[8px] absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 rounded'
            style={{ color }}
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
              คุณอยู่ที่นี่
            </div>
          ) : null}
        </div>
        {tooltipContent ? (
          <div className='train-pin-tooltip-static'>{tooltipContent}</div>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(StationPin);
