import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  gameToStaticMapPixel,
  STATIC_MAP_IMAGE,
} from "@/components/meRedMCoord/mapCoords";
import { useStaticTrainMapScale } from "@/components/train/StaticTrainMap";
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

const ROUTE_LINE_COLOR = "#37c2af";

const TrainPins: React.FC<TrainPinsProps> = ({
  selectedStation = null,
  disabledStations = [],
  onStationClick,
}) => {
  const trainLocations = useGlobalVar((state) => state.trainLocations);
  const playerLocation = useGlobalVar((state) => state.playerLocation);
  const playerMoney = useGlobalVar((state) => state.playerMoney);
  const userCooldownSecondsLeft = useGlobalVar(
    (state) => state.userCooldownSecondsLeft,
  );
  const isOnUserCooldown = userCooldownSecondsLeft > 0;
  const [hoveredStationKey, setHoveredStationKey] = useState<string | null>(
    null,
  );
  const hoverClearTimerRef = useRef<number | null>(null);

  const closestStationKey = useMemo(
    () => findClosestStationKey(playerLocation, trainLocations),
    [playerLocation, trainLocations],
  );

  const currentStationLocation = closestStationKey
    ? trainLocations[closestStationKey]?.npcLocation
    : null;
  const currentStationLabel = closestStationKey
    ? formatTrainStationLabel(closestStationKey)
    : null;

  const mapScale = useStaticTrainMapScale();
  const lineStroke = 2 / mapScale;
  const lineDash = `${8 / mapScale} ${6 / mapScale}`;

  const routeLine = useMemo(() => {
    if (
      !hoveredStationKey ||
      !closestStationKey ||
      hoveredStationKey === closestStationKey
    ) {
      return null;
    }

    const from = trainLocations[closestStationKey]?.npcLocation;
    const to = trainLocations[hoveredStationKey]?.npcLocation;
    if (!from || !to) return null;

    return {
      from: gameToStaticMapPixel(from.x, from.y),
      to: gameToStaticMapPixel(to.x, to.y),
    };
  }, [hoveredStationKey, closestStationKey, trainLocations]);

  const handleHoverStart = useCallback((stationKey: string) => {
    if (hoverClearTimerRef.current) {
      window.clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
    setHoveredStationKey(stationKey);
  }, []);

  const handleHoverEnd = useCallback(() => {
    hoverClearTimerRef.current = window.setTimeout(() => {
      setHoveredStationKey(null);
      hoverClearTimerRef.current = null;
    }, 50);
  }, []);

  return (
    <>
      {routeLine ? (
        <svg
          className='train-route-line absolute inset-0 pointer-events-none'
          width={STATIC_MAP_IMAGE.width}
          height={STATIC_MAP_IMAGE.height}
          viewBox={`0 0 ${STATIC_MAP_IMAGE.width} ${STATIC_MAP_IMAGE.height}`}
        >
          <line
            x1={routeLine.from.x}
            y1={routeLine.from.y}
            x2={routeLine.to.x}
            y2={routeLine.to.y}
            stroke={ROUTE_LINE_COLOR}
            strokeWidth={lineStroke}
            strokeOpacity={0.9}
            strokeDasharray={lineDash}
          />
        </svg>
      ) : null}
      {Object.entries(trainLocations).map(([stationKey, location]) => (
        <StationPin
          key={stationKey}
          stationKey={stationKey}
          location={location}
          selected={selectedStation === stationKey}
          disabled={
            isOnUserCooldown || disabledStations.includes(stationKey)
          }
          isPlayerHere={closestStationKey === stationKey}
          currentStationLocation={currentStationLocation}
          currentStationLabel={currentStationLabel}
          playerMoney={playerMoney}
          onClick={onStationClick}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
