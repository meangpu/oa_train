import type { ReactNode } from "react";
import useGlobalVar from "@/services/GlobalVar";

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface MiniMapProps {
  coords: Coordinates | undefined;
  height?: string;
  width?: string;
  className?: string;
  showPlayerLocation?: boolean;
  showDestinationMarker?: boolean;
  children?: ReactNode;
}

export interface MiniMapRef {
  updateCoords: (coords: Coordinates) => void;
}

export interface CoordinateClickContext {
  match: string;
  cityName?: string;
  isCityCoordinate: boolean;
}

export interface CoordinateButtonProps {
  coords: Coordinates;
  cityName?: string;
  isCityCoordinate: boolean;
  match: string;
  showDistance?: boolean;
  onCoordinateClick?: (
    coords: Coordinates,
    context: CoordinateClickContext
  ) => void;
  onCoordinateCtrlRightClick?: (
    coords: Coordinates,
    context: CoordinateClickContext
  ) => void;
}

export interface MessageWithCoordinatesProps {
  message: string;
  className?: string;
  onCoordinateClick?: (coords: Coordinates, context: CoordinateClickContext) => void;
}

export function coordsToArrayString(
  coords: Coordinates,
  opts?: { round?: boolean; }
): string {
  const round = opts?.round ?? true;
  const x = round ? Math.round(coords.x) : coords.x;
  const y = round ? Math.round(coords.y) : coords.y;
  const z = round ? Math.round(coords.z) : coords.z;
  return `[${x},${y},${z}]`;
}

export function parseVector3String(vector3Str: string): Coordinates {
  const values = vector3Str
    .replace("vector3(", "")
    .replace(")", "")
    .split(",")
    .map((v) => {
      const parsed = parseFloat(v.trim());
      return Number.isNaN(parsed) ? 0 : parsed;
    });

  return {
    x: values[0] || 0,
    y: values[1] || 0,
    z: values[2] || 0,
  };
}

export function vector3StringToShortCoordsText(vector3Str: string): string {
  const coords = parseVector3String(vector3Str);
  return `@[${Math.round(coords.x)},${Math.round(coords.y)},${Math.round(
    coords.z
  )}]`;
}

export function distanceBetweenCoords(a: Coordinates, b: Coordinates): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.hypot(dx, dy, dz);
}

export function distanceSquaredBetweenCoords(
  a: Coordinates,
  b: Coordinates
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function distanceSquaredFromCoords(player: Coordinates, target: Coordinates): number {
  const dx = player.x - target.x;
  const dy = player.y - target.y;
  const dz = player.z - target.z;
  return dx * dx + dy * dy + dz * dz;
}

// Lua style: #(coords1 - coords2) — prefer squared distance for large lists
export function distanceFromPlayerCoords(target: Coordinates): number | null {
  const p = useGlobalVar.getState().playerLocation;
  if (!p) return null;
  return Math.hypot(p.x - target.x, p.y - target.y, p.z - target.z);
}

export function distanceFromPlayerText(target: Coordinates): string | null {
  const dist = distanceFromPlayerCoords(target);
  if (dist == null) return null;
  return `${Math.round(dist).toLocaleString()}m`;
}

export function distanceFromPlayerTextStyle(
  target: Coordinates
): { opacity: number; filter: string; } | null {
  const dist = distanceFromPlayerCoords(target);
  if (dist == null) return null;
  // Monotone fade + brightness boost:
  // - opacity: 0m => 1.0 (100%), >=2000m => 0.5 (50%)
  // - brightness: 0m => 1.5 (150%), >=2000m => 1.0 (100%)
  const t = Math.min(Math.max(dist, 0), 2000) / 2000;
  const opacity = 1 - t * 0.5;
  const brightness = 1.2 - t * 0.5;
  return { opacity, filter: `brightness(${brightness})` };
}

export function distanceSquaredFromPlayerCoords(
  target: Coordinates
): number | null {
  const p = useGlobalVar.getState().playerLocation;
  if (!p) return null;
  return distanceSquaredFromCoords(p, target);
}
