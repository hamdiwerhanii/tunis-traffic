import { create } from "zustand";

import { MapPosition, TrafficLevel } from "@/types";
import { TUNIS_CENTER, DEFAULT_ZOOM } from "@/shared/constants/trafficConstants";

type SelectedPlaceInfo = {
    name: string;
    address: string;
    lat: number;
    lng: number;
};

type MapStoreState = {
    center: MapPosition;
    zoom: number;
    userLocation: MapPosition | null;
    trafficLevel: TrafficLevel;
    isLocating: boolean;
    searchQuery: string;
    selectedDestination: MapPosition | null;
    selectedPlace: SelectedPlaceInfo | null;

    setCenter: (center: MapPosition) => void;
    setZoom: (zoom: number) => void;
    setUserLocation: (location: MapPosition | null) => void;
    setTrafficLevel: (level: TrafficLevel) => void;
    setIsLocating: (isLocating: boolean) => void;
    setSearchQuery: (query: string) => void;
    setSelectedDestination: (destination: MapPosition | null) => void;
    setSelectedPlace: (place: SelectedPlaceInfo | null) => void;
    resetToTunis: () => void;
};

const useMapStore = create<MapStoreState>((set) => ({
    center: TUNIS_CENTER,
    zoom: DEFAULT_ZOOM,
    userLocation: null,
    trafficLevel: "unknown",
    isLocating: false,
    searchQuery: "",
    selectedDestination: null,
    selectedPlace: null,

    setCenter: (center) => set({ center }),
    setZoom: (zoom) => set({ zoom }),
    setUserLocation: (location) => set({ userLocation: location }),
    setTrafficLevel: (level) => set({ trafficLevel: level }),
    setIsLocating: (isLocating) => set({ isLocating }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedDestination: (destination) =>
        set({ selectedDestination: destination }),
    setSelectedPlace: (place) => set({ selectedPlace: place }),
    resetToTunis: () =>
        set({ center: TUNIS_CENTER, zoom: DEFAULT_ZOOM }),
}));

export default useMapStore;
