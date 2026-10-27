import type { LatLng } from "@/modules/Traffic/types";

export const TUNIS_CENTER: LatLng = { lat: 36.8065, lng: 10.1815 };

export const DEFAULT_ZOOM = 12;
export const PLACE_ZOOM = 16;
export const MIN_ZOOM = 7;
export const MAX_ZOOM = 18;

export const TUNISIA_BOUNDS: [[number, number], [number, number]] = [
  [30, 7],
  [38, 12],
];

export const BASE_TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const TRAFFIC_TILES = {
  flow: "/api/traffic/tiles/flow/{z}/{x}/{y}",
  incidents: "/api/traffic/tiles/incidents/{z}/{x}/{y}",
  minZoom: 6,
  attribution: "Traffic &copy; TomTom",
};

export const ROUTE_COLORS = {
  clear: "#22c55e",
  moderate: "#f59e0b",
  heavy: "#ef4444",
  noTraffic: "#3b82f6",
};
