"use client";

import { useCallback } from "react";

import { useMapStore } from "@/modules/Traffic/store/map.store";

const ERROR_MESSAGES: Record<number, string> = {
  1: "Location access was denied. Allow it in your browser settings to use your position.",
  2: "Your position could not be found. Try again in a moment.",
  3: "Finding your position took too long. Try again.",
};

export const useGeolocation = () => {
  const isLocating = useMapStore((state) => state.isLocating);
  const setLocating = useMapStore((state) => state.setLocating);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const focusOn = useMapStore((state) => state.focusOn);
  const notify = useMapStore((state) => state.notify);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      notify("Your browser cannot share your location.", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(point);
        focusOn(point, 15);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        notify(ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES[2], "error");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [focusOn, notify, setLocating, setUserLocation]);

  return { locate, isLocating };
};
