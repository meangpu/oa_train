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

export const LEAFLET_MAP_SW: [number, number] = [
  LEAFLET_MIN_LAT,
  LEAFLET_MIN_LNG,
];
export const LEAFLET_MAP_NE: [number, number] = [
  LEAFLET_MAX_LAT,
  LEAFLET_MAX_LNG,
];
export const LEAFLET_MAP_BOUNDS = {
  width: LEAFLET_RANGE_LNG,
  height: LEAFLET_RANGE_LAT,
} as const;

export const MAP_ZOOM = 3;

/** Static single-image map size (original image coordinate space). */
export const STATIC_MAP_IMAGE = {
  width: 4505,
  height: 3340,
} as const;

export const STATIC_MAP_SW: [number, number] = [
  -STATIC_MAP_IMAGE.height,
  0,
];
export const STATIC_MAP_NE: [number, number] = [0, STATIC_MAP_IMAGE.width];

export const MAP_CENTER_COORDS = {
  x: (GAME_MIN_X + GAME_MAX_X) / 2,
  y: (GAME_MIN_Y + GAME_MAX_Y) / 2,
  z: 0,
} as const;

/** Edit this to move the static train map viewport center (game x, y, z). */
export const STATIC_MAP_VIEW_CENTER = {
  x: MAP_CENTER_COORDS.x,
  y: MAP_CENTER_COORDS.y,
  z: 0,
} as const;

/** Edit this to zoom the static train map (lower = zoomed out, higher = zoomed in). */
export const STATIC_MAP_ZOOM = -2;

/** Pixel offset applied after centering (x = right, y = down). */
export interface MapViewOffset {
  x: number;
  y: number;
}

export const STATIC_MAP_VIEW_OFFSET: MapViewOffset = {
  x: -60,
  y: 0,
};

export const gameToLeaflet = (
  x: number,
  y: number
): { lat: number; lng: number; } => {
  const validX = Number.isNaN(x) || x === undefined ? 0 : x;
  const validY = Number.isNaN(y) || y === undefined ? 0 : y;

  const lng =
    ((validX - GAME_MIN_X) / GAME_RANGE_X) * LEAFLET_RANGE_LNG +
    LEAFLET_MIN_LNG;
  const normalizedY = (validY - GAME_MIN_Y) / GAME_RANGE_Y;
  const lat = LEAFLET_MIN_LAT + normalizedY * LEAFLET_RANGE_LAT;
  return { lat, lng };
};

export const mapCenterToLeaflet = () =>
  gameToLeaflet(MAP_CENTER_COORDS.x, MAP_CENTER_COORDS.y);

export const gameToLeafletStatic = (
  x: number,
  y: number
): { lat: number; lng: number; } => {
  const validX = Number.isNaN(x) || x === undefined ? 0 : x;
  const validY = Number.isNaN(y) || y === undefined ? 0 : y;

  const lng =
    ((validX - GAME_MIN_X) / GAME_RANGE_X) * STATIC_MAP_IMAGE.width;
  const normalizedY = (validY - GAME_MIN_Y) / GAME_RANGE_Y;
  const lat =
    -STATIC_MAP_IMAGE.height + normalizedY * STATIC_MAP_IMAGE.height;
  return { lat, lng };
};

export const staticMapCenterToLeaflet = (
  center = STATIC_MAP_VIEW_CENTER
) => gameToLeafletStatic(center.x, center.y);

