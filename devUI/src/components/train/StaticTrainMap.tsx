import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getStaticMapLayerTransform,
  MapViewOffset,
  STATIC_MAP_IMAGE,
  STATIC_MAP_VIEW_CENTER,
  STATIC_MAP_VIEW_OFFSET,
  STATIC_MAP_ZOOM,
  StaticMapViewport,
} from "@/components/meRedMCoord/mapCoords";
import useGlobalVar from "@/services/GlobalVar";

const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}redmMap.webp`;

const StaticTrainMapContext = createContext({ scale: 1 });

export const useStaticTrainMapScale = () =>
  useContext(StaticTrainMapContext).scale;

export interface MapCenterCoords {
  x: number;
  y: number;
  z?: number;
}

export interface StaticTrainMapProps {
  centerCoords?: MapCenterCoords;
  centerOffset?: MapViewOffset;
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
  dimMapOverlay?: boolean;
  children?: React.ReactNode;
}

const StaticTrainMap: React.FC<StaticTrainMapProps> = ({
  centerCoords = STATIC_MAP_VIEW_CENTER,
  centerOffset = STATIC_MAP_VIEW_OFFSET,
  zoom = STATIC_MAP_ZOOM,
  height = "h-[720px]",
  width = "w-[972px]",
  className = "",
  dimMapOverlay = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRoot = useGlobalVar((state) => state.displayRoot);
  const [viewport, setViewport] = useState<StaticMapViewport>(() =>
    getStaticMapLayerTransform(972, 720, centerCoords, centerOffset, zoom),
  );

  const updateViewport = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();
    if (!containerWidth || !containerHeight) return;

    setViewport(
      getStaticMapLayerTransform(
        containerWidth,
        containerHeight,
        centerCoords,
        centerOffset,
        zoom,
      ),
    );
  }, [centerCoords, centerOffset, zoom]);

  useEffect(() => {
    updateViewport();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updateViewport);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateViewport]);

  useEffect(() => {
    if (!displayRoot) return;
    updateViewport();
    const raf = requestAnimationFrame(updateViewport);
    const timer = window.setTimeout(updateViewport, 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [displayRoot, updateViewport]);

  const layerStyle = useMemo(
    () => ({
      width: viewport.width,
      height: viewport.height,
      transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
    }),
    [viewport],
  );
  const mapContextValue = useMemo(
    () => ({ scale: viewport.scale }),
    [viewport.scale],
  );

  return (
    <div
      ref={containerRef}
      className={`static-train-map ${height} ${width} ${className} relative overflow-hidden select-none bg-[#252525] rounded-lg`}
    >
      <div
        className='static-train-map-layer absolute left-0 top-0 origin-top-left'
        style={layerStyle}
      >
        <div
          className={`static-train-map-image-wrap relative${dimMapOverlay ? " static-train-map-dim" : ""}`}
        >
          <img
            src={MAP_IMAGE_URL}
            alt=''
            width={STATIC_MAP_IMAGE.width}
            height={STATIC_MAP_IMAGE.height}
            draggable={false}
            className='static-train-map-image block max-w-none max-h-none '
          />
        </div>
        <StaticTrainMapContext.Provider value={mapContextValue}>
          <div className='static-train-map-overlay absolute inset-0'>
            {children}
          </div>
        </StaticTrainMapContext.Provider>
      </div>
    </div>
  );
};

export default React.memo(StaticTrainMap);
