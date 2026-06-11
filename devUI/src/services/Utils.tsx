/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";

export interface Coord3 {
  x: number;
  y: number;
  z: number;
}

export function isValidCoord3(
  coord: Partial<Coord3> | undefined | null,
): coord is Coord3 {
  if (!coord) return false;
  if (coord.x === undefined || coord.y === undefined) return false;
  if (Number.isNaN(coord.x) || Number.isNaN(coord.y)) return false;
  return true;
}

export function distanceBetweenCoords(a: Coord3, b: Coord3): number {
  const dzA = a.z ?? 0;
  const dzB = b.z ?? 0;
  return Math.hypot(a.x - b.x, a.y - b.y, dzA - dzB);
}

export function distanceSquaredBetweenCoords(a: Coord3, b: Coord3): number {
  const dzA = a.z ?? 0;
  const dzB = b.z ?? 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = dzA - dzB;
  return dx * dx + dy * dy + dz * dz;
}

export function formatDistanceText(distance: number): string {
  return `${Math.round(distance).toLocaleString()}m`;
}

export function distanceBetweenCoordsText(
  from: Coord3,
  to: Coord3,
): string | null {
  if (!isValidCoord3(from) || !isValidCoord3(to)) return null;
  return formatDistanceText(distanceBetweenCoords(from, to));
}

export function roundDownToHundred(value: number): number {
  return Math.floor(value / 100) * 100;
}

export function getTravelCost(distance: number): number {
  return roundDownToHundred(Math.round(distance));
}

export function getWaitTimeSeconds(cost: number): number {
  return Math.floor(cost / 100);
}

export function formatTravelCostText(distance: number): ReactNode {
  const cost = getTravelCost(distance);
  return (
    <div>
      ค่าเดินทาง{" "}
      <span className='text-green-light font-extrabold'>
        ${cost.toLocaleString()}
      </span>
    </div>
  );
}

export function formatCooldownRemaining(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  if (total <= 0) return "0 วินาที";
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours} ชม. ${minutes} นาที`;
  }
  if (minutes > 0) {
    return `${minutes} นาที ${secs} วินาที`;
  }
  return `${secs} วินาที`;
}

export function formatWaitTimeText(distance: number): ReactNode {
  const seconds = getWaitTimeSeconds(getTravelCost(distance));
  return (
    <div>
      เวลารอ{" "}
      <span className='text-green-light font-extrabold'>
        {seconds.toLocaleString()}
      </span>{" "}
      วินาที
    </div>
  );
}

export function formatTrainStationLabel(stationKey: string): string {
  return stationKey
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function findClosestStationKey(
  playerLocation: Coord3,
  trainLocations: Record<string, { npcLocation: Coord3 }>,
): string | null {
  if (!isValidCoord3(playerLocation)) return null;

  let closestKey: string | null = null;
  let minDistSq = Infinity;

  for (const [stationKey, location] of Object.entries(trainLocations)) {
    if (!isValidCoord3(location.npcLocation)) continue;
    const distSq = distanceSquaredBetweenCoords(
      playerLocation,
      location.npcLocation,
    );
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closestKey = stationKey;
    }
  }

  return closestKey;
}

export function formatDate(dateInput: string | number | Date): string {
  if (!dateInput || dateInput === "") {
    return "";
  }

  let date;
  if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    console.warn("Invalid dateInput type:", typeof dateInput, dateInput);
    return "";
  }

  if (isNaN(date.getTime())) {
    console.warn("Invalid date value:", dateInput);
    return "";
  }

  // Format the date
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export function getItemImageByName(name: string) {
  const imageUrl = import.meta.env.DEV
    ? // ? "https://cdn-icons-png.freepik.com/256/17018/17018802.png?semt=ais_hybrid"
      `https://168.222.21.2/items/${name}.png`
    : `nui://vorp_inventory/html/img/items/${name}.png`;
  return imageUrl;
}

export const getRandomValue = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

export const copyToClipboard = (text: string) => {
  try {
    // Create a text area element to copy from
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make the textarea invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";

    // Add it to the document
    document.body.appendChild(textArea);

    // Select and copy the text
    textArea.select();
    document.execCommand("copy");

    // Remove the textarea
    document.body.removeChild(textArea);

    // toast.success(`Copied "${text}" to clipboard!`);
  } catch (err) {
    console.error("Failed to copy text: ", err);
    // toast.error("Failed to copy to clipboard");
  }
};

// อันนี้ต้องคงไว้แบบนี้ ห้ามเปลี่ยนเป็นพิมพ์เล็กเพราะว่าเป็น builtin ของ redM
export const GetParentResourceName = (): string => {
  return typeof window.GetParentResourceName === "function"
    ? window.GetParentResourceName()
    : "mock-resource-name";
};
