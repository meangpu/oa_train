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

export const gameToLeaflet = (
  x: number,
  y: number
): { lat: number; lng: number } => {
  const validX = Number.isNaN(x) || x === undefined ? 0 : x;
  const validY = Number.isNaN(y) || y === undefined ? 0 : y;

  const lng =
    ((validX - GAME_MIN_X) / GAME_RANGE_X) * LEAFLET_RANGE_LNG +
    LEAFLET_MIN_LNG;
  const normalizedY = (validY - GAME_MIN_Y) / GAME_RANGE_Y;
  const lat = LEAFLET_MIN_LAT + normalizedY * LEAFLET_RANGE_LAT;
  return { lat, lng };
};
