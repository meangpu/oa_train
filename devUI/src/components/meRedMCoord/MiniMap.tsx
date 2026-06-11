import React, {
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IoMdPin } from "react-icons/io";
import { FaCircle } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import { MiniMapProps, MiniMapRef } from "./types";
import useGlobalVar from "@/services/GlobalVar";

const DEFAULT_ZOOM = 3;

const GAME_MIN_X = -7060;
const GAME_MAX_X = 4060;
const GAME_MIN_Y = -5000;
const GAME_MAX_Y = 3840;
const GAME_RANGE_X = GAME_MAX_X - GAME_MIN_X;
const GAME_RANGE_Y = GAME_MAX_Y - GAME_MIN_Y;

const LEAFLET_MIN_LAT = -144;
const LEAFLET_MAX_LAT = 0;
const LEAFLET_MIN_LNG = 0;
const LEAFLET_MAX_LNG = 176;
const LEAFLET_RANGE_LAT = LEAFLET_MAX_LAT - LEAFLET_MIN_LAT;
const LEAFLET_RANGE_LNG = LEAFLET_MAX_LNG - LEAFLET_MIN_LNG;

const gameToLeaflet = (x: number, y: number): { lat: number; lng: number } => {
  const validX = Number.isNaN(x) || x === undefined ? 0 : x;
  const validY = Number.isNaN(y) || y === undefined ? 0 : y;

  const lng =
    ((validX - GAME_MIN_X) / GAME_RANGE_X) * LEAFLET_RANGE_LNG +
    LEAFLET_MIN_LNG;
  const normalizedY = (validY - GAME_MIN_Y) / GAME_RANGE_Y;
  const lat = LEAFLET_MIN_LAT + normalizedY * LEAFLET_RANGE_LAT;
  return { lat, lng };
};

const mapBoundary = L.latLngBounds(
  [LEAFLET_MIN_LAT, LEAFLET_MIN_LNG],
  [LEAFLET_MAX_LAT, LEAFLET_MAX_LNG]
);

const isValidCoords = (coords: { x: number; y: number } | undefined) => {
  if (!coords) return false;
  if (coords.x === undefined || coords.y === undefined) return false;
  if (Number.isNaN(coords.x) || Number.isNaN(coords.y)) return false;
  return true;
};

const coordsChanged = (
  prev: { x: number; y: number } | null,
  next: { x: number; y: number },
  threshold = 0.01
) => {
  if (!prev) return true;
  return (
    Math.abs(next.x - prev.x) > threshold ||
    Math.abs(next.y - prev.y) > threshold
  );
};

const MapController: React.FC<{
  coords: { x: number; y: number; z: number } | undefined;
  onMapReady?: (map: L.Map) => void;
}> = ({ coords, onMapReady }) => {
  const map = useMap();
  const isInitialized = useRef(false);
  const lastCoords = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (coords) {
      try {
        if (!isValidCoords(coords)) {
          console.warn("Invalid coordinates detected:", coords);
          return;
        }

        const mapCoords = gameToLeaflet(coords.x, coords.y);

        if (coordsChanged(lastCoords.current, coords)) {
          map.setView([mapCoords.lat, mapCoords.lng], DEFAULT_ZOOM);
          lastCoords.current = { x: coords.x, y: coords.y };

          if (!isInitialized.current) {
            isInitialized.current = true;
          }
        }
      } catch (error) {
        console.error("Error setting map view:", error);
      }
    }
  }, [coords, map]);

  return null;
};

const createCustomIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div className='relative w-[20px] h-[20px]'>
      <div className='text-[9px] text-white-real absolute -top-4 -left-1 w-50'>
        จุดหมาย
      </div>
      <IoMdPin
        style={{
          color: "#ffffff",
          fontSize: "20px",
        }}
      />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "player-marker-icon",
    iconSize: [20, 20],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const createPlayerIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div className='relative w-[8px] h-[8px]'>
      <FaCircle
        style={{
          color: "#37c2af",
          fontSize: "8px",
          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))",
        }}
      />
      <div className='text-[9px] text-green-light absolute -bottom-2.5 -left-1 w-50'>
        คุณ
      </div>
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "player-location-icon",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const MiniMap = React.memo(
  forwardRef<MiniMapRef, MiniMapProps>(
    (
      {
        coords,
        height = "h-34",
        width = "w-full",
        className = "",
        showPlayerLocation = true,
      },
      ref
    ) => {
      const mapRef = useRef<L.Map | null>(null);
      const markerRef = useRef<L.Marker | null>(null);
      const lastCoords = useRef<{ x: number; y: number; z: number } | null>(
        null
      );
      const icon = useMemo(() => createCustomIcon(), []);
      const playerIcon = useMemo(() => createPlayerIcon(), []);
      const playerLocation = useGlobalVar((state) => state.playerLocation);
      const shouldShowPlayerLocation =
        showPlayerLocation && isValidCoords(playerLocation);
      const showDestinationMarker =
        !shouldShowPlayerLocation ||
        !coords ||
        coordsChanged(
          { x: playerLocation.x, y: playerLocation.y },
          coords
        );

      useImperativeHandle(
        ref,
        () => ({
          updateCoords: (newCoords: { x: number; y: number; z: number }) => {
            if (!mapRef.current) {
              lastCoords.current = newCoords;
              return;
            }

            try {
              if (!isValidCoords(newCoords)) {
                console.warn("Invalid coordinates detected:", newCoords);
                return;
              }

              const shouldUpdatePosition = coordsChanged(
                lastCoords.current
                  ? { x: lastCoords.current.x, y: lastCoords.current.y }
                  : null,
                newCoords
              );

              if (!shouldUpdatePosition) {
                lastCoords.current = newCoords;
                return;
              }

              const mapCoords = gameToLeaflet(newCoords.x, newCoords.y);

              mapRef.current.setView(
                [mapCoords.lat, mapCoords.lng],
                DEFAULT_ZOOM
              );

              if (markerRef.current) {
                markerRef.current.setLatLng([mapCoords.lat, mapCoords.lng]);
              }

              lastCoords.current = newCoords;
            } catch (error) {
              console.error("Error updating map coordinates:", error);
            }
          },
        }),
        []
      );

      const handleMapReady = useCallback((map: L.Map) => {
        mapRef.current = map;
        if (lastCoords.current) {
          const storedCoords = lastCoords.current;
          const mapCoords = gameToLeaflet(storedCoords.x, storedCoords.y);
          map.setView([mapCoords.lat, mapCoords.lng], DEFAULT_ZOOM);
        }
      }, []);

      const handleMarkerRef = useCallback((marker: L.Marker | null) => {
        markerRef.current = marker;
      }, []);

      if (!coords) return null;

      if (!isValidCoords(coords)) {
        return (
          <div
            className={`${height} ${width} ${className} relative z-10 bg-bg-black-more flex items-center justify-center`}
          >
            <span className='text-grey text-sm'>Invalid coordinates</span>
          </div>
        );
      }

      try {
        return (
          <div className={`${height} ${width} ${className} relative z-10`}>
            <MapContainer
              center={[0, 0]}
              zoom={DEFAULT_ZOOM}
              minZoom={2}
              maxZoom={7}
              className='h-full w-full relative z-10'
              zoomControl={false}
              attributionControl={false}
              crs={L.CRS.Simple}
              preferCanvas={true}
              keyboard={false}
            >
              <TileLayer
                url='https://map-tiles.b-cdn.net/assets/rdr3/webp/darkmode/{z}/{x}_{y}.webp'
                minZoom={2}
                maxZoom={7}
                maxNativeZoom={7}
                tileSize={256}
                noWrap={true}
                bounds={mapBoundary}
              />
              <MapController coords={coords} onMapReady={handleMapReady} />
              {showDestinationMarker ? (
                <Marker
                  position={gameToLeaflet(coords.x, coords.y)}
                  icon={icon}
                  ref={handleMarkerRef}
                />
              ) : null}
              {shouldShowPlayerLocation ? (
                <Marker
                  position={gameToLeaflet(playerLocation.x, playerLocation.y)}
                  icon={playerIcon}
                />
              ) : null}
            </MapContainer>
          </div>
        );
      } catch (error) {
        console.error("Error rendering MiniMap:", error);
        return (
          <div
            className={`${height} ${width} ${className} relative z-10 bg-gray-800 flex items-center justify-center`}
          >
            <span className='text-grey text-sm'>Map unavailable</span>
          </div>
        );
      }
    }
  )
);

MiniMap.displayName = "MiniMap";

export default MiniMap;
