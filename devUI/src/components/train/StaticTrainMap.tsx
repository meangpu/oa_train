import React, { useCallback, useEffect, useMemo } from "react";
import { MapContainer, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  gameToLeafletStatic,
  MapViewOffset,
  STATIC_MAP_NE,
  STATIC_MAP_SW,
  STATIC_MAP_VIEW_CENTER,
  STATIC_MAP_VIEW_OFFSET,
  STATIC_MAP_ZOOM,
} from "@/components/meRedMCoord/mapCoords";
import useGlobalVar from "@/services/GlobalVar";

const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}redmMap.webp`;
const mapBoundary = L.latLngBounds(STATIC_MAP_SW, STATIC_MAP_NE);

export interface MapCenterCoords {
  x: number;
  y: number;
  z?: number;
}

const setMapViewWithOffset = (
  map: L.Map,
  center: { lat: number; lng: number },
  zoom: number,
  offset: MapViewOffset,
) => {
  const latLng = L.latLng(center.lat, center.lng);
  if (!offset.x && !offset.y) {
    map.setView(latLng, zoom, { animate: false });
    return;
  }
  const point = map.project(latLng, zoom).subtract([offset.x, offset.y]);
  map.setView(map.unproject(point, zoom), zoom, { animate: false });
};

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

const refreshMapSize = (map: L.Map) => {
  map.invalidateSize({ animate: false, pan: false });
};

const MapViewController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  offset: MapViewOffset;
}> = ({ center, zoom, offset }) => {
  const map = useMap();
  const displayRoot = useGlobalVar((state) => state.displayRoot);

  const syncView = useCallback(() => {
    refreshMapSize(map);
    setMapViewWithOffset(map, center, zoom, offset);
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
  }, [map, center.lat, center.lng, zoom, offset.x, offset.y]);

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
  centerCoords = STATIC_MAP_VIEW_CENTER,
  centerOffset = STATIC_MAP_VIEW_OFFSET,
  zoom = STATIC_MAP_ZOOM,
  height = "h-[720px]",
  width = "w-[972px]",
  className = "",
  dimMapOverlay = true,
  children,
}) => {
  const mapCenter = useMemo(
    () => gameToLeafletStatic(centerCoords.x, centerCoords.y),
    [centerCoords.x, centerCoords.y],
  );

  return (
    <div
      className={`static-train-map ${height} ${width} ${className} relative overflow-hidden select-none`}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        minZoom={zoom}
        maxZoom={zoom}
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
        <MapViewController
          center={mapCenter}
          zoom={zoom}
          offset={centerOffset}
        />
        {children}
      </MapContainer>
    </div>
  );
};

export default React.memo(StaticTrainMap);
