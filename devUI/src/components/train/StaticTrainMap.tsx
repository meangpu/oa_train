import React, { useCallback, useEffect } from "react";
import { MapContainer, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  LEAFLET_MAP_NE,
  LEAFLET_MAP_SW,
  MAP_ZOOM,
  mapCenterToLeaflet,
} from "@/components/meRedMCoord/mapCoords";
import useGlobalVar from "@/services/GlobalVar";

const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}redmMap.webp`;
const mapBoundary = L.latLngBounds(LEAFLET_MAP_SW, LEAFLET_MAP_NE);
const mapCenter = mapCenterToLeaflet();

export interface StaticTrainMapProps {
  height?: string;
  width?: string;
  className?: string;
  dimMapOverlay?: boolean;
  children?: React.ReactNode;
}

const refreshMapSize = (map: L.Map) => {
  map.invalidateSize({ animate: false, pan: false });
};

const MapViewController: React.FC = () => {
  const map = useMap();
  const displayRoot = useGlobalVar((state) => state.displayRoot);

  const syncView = useCallback(() => {
    refreshMapSize(map);
    map.setView([mapCenter.lat, mapCenter.lng], MAP_ZOOM, { animate: false });
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
  }, [map]);

  useEffect(() => {
    syncView();
    const raf = requestAnimationFrame(syncView);
    const timer = window.setTimeout(syncView, 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [syncView]);

  useEffect(() => {
    if (!displayRoot) return;
    syncView();
    const raf = requestAnimationFrame(syncView);
    const timer = window.setTimeout(syncView, 150);
    const timer2 = window.setTimeout(syncView, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
    };
  }, [displayRoot, syncView]);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(syncView);
    observer.observe(container);
    return () => observer.disconnect();
  }, [map, syncView]);

  return null;
};

const StaticTrainMap: React.FC<StaticTrainMapProps> = ({
  height = "h-[1152px]",
  width = "w-[1408px]",
  className = "",
  dimMapOverlay = true,
  children,
}) => {
  return (
    <div
      className={`static-train-map ${height} ${width} ${className} relative overflow-hidden select-none`}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={MAP_ZOOM}
        minZoom={MAP_ZOOM}
        maxZoom={MAP_ZOOM}
        maxBounds={mapBoundary}
        maxBoundsViscosity={1}
        crs={L.CRS.Simple}
        className={`h-full w-full${dimMapOverlay ? " minimap-dim-overlay" : ""}`}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <ImageOverlay url={MAP_IMAGE_URL} bounds={mapBoundary} />
        <MapViewController />
        {children}
      </MapContainer>
    </div>
  );
};

export default React.memo(StaticTrainMap);
