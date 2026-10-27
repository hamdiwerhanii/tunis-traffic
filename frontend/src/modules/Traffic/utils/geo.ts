import type { LatLng } from "@/modules/Traffic/types";

const SAME_PLACE_DEGREES = 0.0001;

export const isSamePlace = (a: LatLng, b: LatLng): boolean =>
  Math.abs(a.lat - b.lat) < SAME_PLACE_DEGREES && Math.abs(a.lng - b.lng) < SAME_PLACE_DEGREES;

export const shortName = (displayName: string): string => displayName.split(",")[0].trim();
