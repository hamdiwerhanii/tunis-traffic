export type LatLng = {
  lat: number;
  lng: number;
};

export type Place = LatLng & {
  name: string;
  address?: string | null;
};

export type Favorite = Place & {
  id: string;
  address: string | null;
  createdAt: string;
};

export type SearchEntry = LatLng & {
  id: string;
  query: string;
  placeName: string | null;
  searchedAt: string;
};

export type PlaceResult = Place & {
  id: string;
  address: string;
};

export type RoutePlan = {
  provider: "tomtom" | "osrm";
  liveTraffic: boolean;
  distanceKm: number;
  durationMinutes: number;
  delayMinutes: number;
  departAt: string;
  arriveAt: string;
  path: [number, number][];
};

export type PlannedRoute = RoutePlan & {
  scheduled: boolean;
};

export type RouteRequest = {
  from: LatLng;
  to: LatLng;
  arriveAt?: Date;
};

export type TrafficLevel = "low" | "medium" | "heavy";

export type TypicalTraffic = {
  level: TrafficLevel;
  isPeak: boolean;
  peakLabel: string | null;
  peakEnd: string | null;
  nextPeak: string;
};

export type PanelTab = "trip" | "saved" | "recent";
