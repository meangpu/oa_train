export function formatStationLabel(stationKey: string): string {
  return stationKey
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
