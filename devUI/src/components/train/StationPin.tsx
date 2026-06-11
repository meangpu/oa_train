import React, { useCallback, useMemo } from "react";
import { FaTrain } from "react-icons/fa";
import { gameToStaticMapPixel } from "@/components/meRedMCoord/mapCoords";
import { useStaticTrainMapScale } from "@/components/train/StaticTrainMap";
import useGlobalModal from "@/services/GlobalModal";
import { NuiProxy } from "@/services/NuiProxy";
import {
  Coord3,
  distanceBetweenCoords,
  formatDistanceText,
  formatTrainStationLabel,
  formatWaitTimeText,
  getTravelCost,
  getWaitTimeSeconds,
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
  playerMoney?: number;
  onClick?: (context: StationPinContext) => void;
  onHoverStart?: (stationKey: string) => void;
  onHoverEnd?: () => void;
}

const PIN_GREEN = "#37c2af";
const PIN_HIT_SIZE = 44;

function renderTravelCost(cost: number, canAfford: boolean) {
  return (
    <div className='flex flex-col items-center gap-0.5'>
      <div>
        ค่าเดินทาง{" "}
        <span
          className={`font-extrabold ${canAfford ? "text-green-light" : "text-red"}`}
        >
          ${cost.toLocaleString()}
        </span>
      </div>
      {!canAfford ? (
        <span className='text-[10px] text-red-light leading-tight'>
          คุณมีเงินไม่พอ
        </span>
      ) : null}
    </div>
  );
}

const StationPin: React.FC<StationPinProps> = ({
  stationKey,
  location,
  selected = false,
  disabled = false,
  isPlayerHere = false,
  currentStationLocation = null,
  currentStationLabel = null,
  playerMoney = 0,
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
    const cost = getTravelCost(distance);
    const canAfford = playerMoney >= cost;
    const waitTimeText = formatWaitTimeText(distance);
    const distanceLine = currentStationLabel
      ? `ระยะ ${distanceText}`
      : distanceText;

    return (
      <div className='flex flex-col items-center gap-0.5 leading-tight'>
        <span>{distanceLine}</span>
        {renderTravelCost(cost, canAfford)}
        <span>{waitTimeText}</span>
      </div>
    );
  }, [
    currentStationLocation,
    currentStationLabel,
    isPlayerHere,
    location.npcLocation,
    playerMoney,
  ]);

  const { x, y } = location.npcLocation;
  const mapScale = useStaticTrainMapScale();
  const pinScreenScale = 1 / mapScale;

  const handleClick = useCallback(() => {
    if (disabled || isPlayerHere) return;

    const fromLabel = currentStationLabel ?? "สถานีปัจจุบัน";
    const toLabel = label;

    let cost = 0;
    let waitSeconds = 0;
    if (
      currentStationLocation &&
      isValidCoord3(currentStationLocation) &&
      isValidCoord3(location.npcLocation)
    ) {
      const distance = distanceBetweenCoords(
        currentStationLocation,
        location.npcLocation,
      );
      cost = getTravelCost(distance);
      waitSeconds = getWaitTimeSeconds(cost);
    }
    const canAfford = playerMoney >= cost;

    const { showModal, hideModal } = useGlobalModal.getState();

    showModal(
      <div className='flex flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg min-w-[300px]'>
        <p className='text-center '>เดินทางจาก</p>
        <div className='text-center flex-center gap-1'>
          <span className='text-white font-extrabold bg-grey-more-more px-1 rounded'>
            {fromLabel}
          </span>
          {"ไป"}
          <span className='text-white font-extrabold bg-grey-more-more px-1 rounded'>
            {toLabel}
          </span>
        </div>
        <div className='flex flex-col items-center gap-1 text-sm'>
          {renderTravelCost(cost, canAfford)}
          <div>
            เวลารอ{" "}
            <span className='text-green-light font-extrabold'>
              {waitSeconds.toLocaleString()}
            </span>{" "}
            วินาที
          </div>
        </div>
        <div className='flex justify-center gap-2 mt-4'>
          <button
            type='button'
            className='btn-outline me-p-sm'
            onClick={() => hideModal()}
          >
            ยกเลิก
          </button>
          <button
            type='button'
            className='btn-green me-p-sm'
            disabled={!canAfford}
            onClick={() => {
              hideModal();
              void NuiProxy.call("TeleportToStation", {
                locationKey: stationKey,
              });
              onClick?.({ stationKey, label, location });
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>,
      {
        closeOnClickEmpty: false,
        closeBtnClass: "hidden",
      },
    );
  }, [
    disabled,
    isPlayerHere,
    currentStationLabel,
    currentStationLocation,
    label,
    location,
    onClick,
    playerMoney,
    stationKey,
  ]);

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
      className={`train-pin absolute${disabled ? " train-pin-disabled" : ""}${isPlayerHere ? " train-pin-here" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${pinScreenScale})`,
      }}
      role='button'
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
              opacity: disabled ? 0.6 : 1,
            }}
          />
          {isPlayerHere ? (
            <div
              className='text-[8px] absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap'
              style={{
                color: PIN_GREEN,
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
