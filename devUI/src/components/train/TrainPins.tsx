import React, { useCallback, useMemo, useRef, useState } from "react";
import { Polyline } from "react-leaflet";
import { gameToLeaflet } from "@/components/meRedMCoord/mapCoords";
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

  const routeLinePositions = useMemo(() => {
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

    const fromPos = gameToLeaflet(from.x, from.y);
    const toPos = gameToLeaflet(to.x, to.y);
    return [
      [fromPos.lat, fromPos.lng],
      [toPos.lat, toPos.lng],
    ] as [number, number][];
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
      {routeLinePositions ? (
        <Polyline
          positions={routeLinePositions}
          pathOptions={{
            color: ROUTE_LINE_COLOR,
            weight: 2,
            opacity: 0.85,
            dashArray: "8 6",
          }}
        />
      ) : null}
      {Object.entries(trainLocations).map(([stationKey, location]) => (
        <StationPin
          key={stationKey}
          stationKey={stationKey}
          location={location}
          selected={selectedStation === stationKey}
          disabled={disabledStations.includes(stationKey)}
          isPlayerHere={closestStationKey === stationKey}
          currentStationLocation={currentStationLocation}
          currentStationLabel={currentStationLabel}
          onClick={onStationClick}
          onHoverStart={() => handleHoverStart(stationKey)}
          onHoverEnd={handleHoverEnd}
        />
      ))}
    </>
  );
};

export default React.memo(TrainPins);
