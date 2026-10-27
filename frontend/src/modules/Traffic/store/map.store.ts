import { create } from "zustand";

import { PLACE_ZOOM } from "@/modules/Traffic/constants/map";
import type { LatLng, PanelTab, Place, PlannedRoute } from "@/modules/Traffic/types";

type Focus = LatLng & { zoom: number; key: number };
type Notice = { key: number; text: string; tone: "info" | "error" };

type MapState = {
  focus: Focus | null;
  selectedPlace: Place | null;
  destination: Place | null;
  userLocation: LatLng | null;
  isLocating: boolean;
  route: PlannedRoute | null;
  activeTab: PanelTab;
  isPanelOpen: boolean;
  notice: Notice | null;

  focusOn: (point: LatLng, zoom?: number) => void;
  selectPlace: (place: Place | null) => void;
  planTripTo: (place: Place) => void;
  setDestination: (place: Place | null) => void;
  setUserLocation: (point: LatLng) => void;
  setLocating: (isLocating: boolean) => void;
  setRoute: (route: PlannedRoute | null) => void;
  setActiveTab: (tab: PanelTab) => void;
  setPanelOpen: (isOpen: boolean) => void;
  notify: (text: string, tone?: Notice["tone"]) => void;
  dismissNotice: () => void;
};

let counter = 0;
const nextKey = () => ++counter;

export const useMapStore = create<MapState>((set) => ({
  focus: null,
  selectedPlace: null,
  destination: null,
  userLocation: null,
  isLocating: false,
  route: null,
  activeTab: "trip",
  isPanelOpen: false,
  notice: null,

  focusOn: (point, zoom = PLACE_ZOOM) => set({ focus: { ...point, zoom, key: nextKey() } }),
  selectPlace: (place) =>
    set(
      place
        ? { selectedPlace: place, focus: { lat: place.lat, lng: place.lng, zoom: PLACE_ZOOM, key: nextKey() } }
        : { selectedPlace: null },
    ),
  planTripTo: (place) =>
    set({ destination: place, route: null, activeTab: "trip", isPanelOpen: true }),
  setDestination: (destination) => set({ destination, route: null }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setLocating: (isLocating) => set({ isLocating }),
  setRoute: (route) => set({ route }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setPanelOpen: (isPanelOpen) => set({ isPanelOpen }),
  notify: (text, tone = "info") => set({ notice: { text, tone, key: nextKey() } }),
  dismissNotice: () => set({ notice: null }),
}));
