import React from "react";
import ReactDOM from "react-dom";
import MiniMap from "./MiniMap";
import {
  coordsToArrayString,
  distanceFromPlayerText,
  distanceFromPlayerTextStyle,
} from "./types";
import useGlobalVar from "@/services/GlobalVar";
import useCoordTooltipStore from "./useCoordTooltipStore";

const getTooltipElement = () => {
  if (typeof document === "undefined") return null;
  let tooltipElement = document.getElementById("tooltip-root");
  if (!tooltipElement) {
    tooltipElement = document.createElement("div");
    tooltipElement.id = "tooltip-root";
    tooltipElement.style.position = "fixed";
    tooltipElement.style.top = "0";
    tooltipElement.style.left = "0";
    tooltipElement.style.pointerEvents = "none";
    tooltipElement.style.zIndex = "9999";
    document.body.appendChild(tooltipElement);
  }
  return tooltipElement;
};

const DEFAULTS = {
  mapHeight: "h-[265px]",
  mapWidth: "w-[472px]",
  mapClassName: "rounded bg-grey-more",
  tooltipClassName:
    "text-white rounded-lg shadow-lg z-[9999] box-content border border-grey-more",
  showDelay: 100,
  showDistance: true,
} as const;

const GlobalCoordinatesTooltip: React.FC = () => {
  const displayRoot = useGlobalVar((s) => s.displayRoot);
  const uiEnabled = useGlobalVar((s) => s.uiEnabled);
  const tooltip = useCoordTooltipStore((s) => s.tooltip);

  const [tooltipRoot, setTooltipRoot] = React.useState<HTMLElement | null>(
    null
  );
  const [shouldShowMap, setShouldShowMap] = React.useState(false);
  const [hasMountedMap, setHasMountedMap] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapRef = React.useRef<{
    updateCoords: (coords: { x: number; y: number; z: number }) => void;
  } | null>(null);
  const lastCoordsRef = React.useRef<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const initialCoordsRef = React.useRef<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  React.useEffect(() => {
    if (!tooltipRoot) setTooltipRoot(getTooltipElement());
  }, [tooltipRoot]);

  const forceClose = React.useCallback(() => {
    setShouldShowMap(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!displayRoot || !uiEnabled) forceClose();
  }, [displayRoot, uiEnabled, forceClose]);

  const coordsChanged = React.useCallback(
    (next: { x: number; y: number; z: number }) => {
      if (!lastCoordsRef.current) return true;
      const threshold = 0.01;
      const prev = lastCoordsRef.current;
      return (
        Math.abs(next.x - prev.x) > threshold ||
        Math.abs(next.y - prev.y) > threshold ||
        Math.abs(next.z - prev.z) > threshold
      );
    },
    []
  );

  React.useEffect(() => {
    const coords = tooltip?.coords ?? null;
    if (!coords) return;

    if (coordsChanged(coords)) {
      lastCoordsRef.current = coords;
      if (mapRef.current) mapRef.current.updateCoords(coords);
    }
  }, [tooltip?.coords, coordsChanged]);

  React.useEffect(() => {
    if (!tooltip?.visible) {
      forceClose();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setShouldShowMap(true);
    }, DEFAULTS.showDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [tooltip?.visible, forceClose]);

  React.useEffect(() => {
    if (shouldShowMap) setHasMountedMap(true);
  }, [shouldShowMap]);

  React.useEffect(() => {
    if (!hasMountedMap) return;
    if (!initialCoordsRef.current && tooltip?.coords) {
      initialCoordsRef.current = tooltip.coords;
    }
  }, [hasMountedMap, tooltip?.coords]);

  const tooltipStyle = React.useMemo(() => {
    const mouse = tooltip?.mouse ?? { x: 0, y: 0 };
    const screenWidth = typeof window === "undefined" ? 0 : window.innerWidth;
    const tooltipWidth = 472;
    const isOnRightSide = mouse.x > screenWidth * 0.63;
    const leftPosition = isOnRightSide
      ? mouse.x - tooltipWidth - 40
      : mouse.x + 40;
    return {
      position: "fixed" as const,
      left: `${leftPosition}px`,
      top: `${mouse.y - 132}px`,
    };
  }, [tooltip?.mouse]);

  const tooltipClasses = React.useMemo(() => {
    return `${DEFAULTS.tooltipClassName} transition-opacity duration-10 ${
      shouldShowMap
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`;
  }, [shouldShowMap]);

  const handleMapRef = React.useCallback(
    (
      ref: {
        updateCoords: (coords: { x: number; y: number; z: number }) => void;
      } | null
    ) => {
      mapRef.current = ref;
    },
    []
  );

  const coords = tooltip?.coords ?? null;
  const distanceText = React.useMemo(() => {
    if (!DEFAULTS.showDistance) return null;
    if (!shouldShowMap) return null;
    if (!coords) return null;
    return distanceFromPlayerText(coords);
  }, [shouldShowMap, coords]);

  const distanceStyle = React.useMemo(() => {
    if (!DEFAULTS.showDistance) return null;
    if (!shouldShowMap) return null;
    if (!coords) return null;
    return distanceFromPlayerTextStyle(coords);
  }, [shouldShowMap, coords]);

  if (!tooltipRoot) return null;
  if (!coords) return null;

  return ReactDOM.createPortal(
    <div
      className={tooltipClasses}
      style={{
        ...tooltipStyle,
        visibility: tooltip.visible ? "visible" : "hidden",
      }}
    >
      {hasMountedMap ? (
        <>
          <div className='absolute h-center -top-8 text-white bg-bg-black-opacity rounded px-2 py-0.5 w-full '>
            <div className='flex-center gap-2'>
              <span>กดเพื่อนำทางไปยัง</span>
              <span className='text-grey '>{coordsToArrayString(coords)}</span>
              {distanceText ? (
                <span
                  className='text-white bg-grey-more px-1 rounded font-bold'
                  style={distanceStyle ?? undefined}
                >
                  {distanceText}
                </span>
              ) : null}
            </div>
          </div>
          <MiniMap
            ref={handleMapRef}
            coords={initialCoordsRef.current ?? coords}
            height={DEFAULTS.mapHeight}
            width={DEFAULTS.mapWidth}
            className={DEFAULTS.mapClassName}
          />
        </>
      ) : null}
    </div>,
    tooltipRoot
  );
};

export default React.memo(GlobalCoordinatesTooltip);
