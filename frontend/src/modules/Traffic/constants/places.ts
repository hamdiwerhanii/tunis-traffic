import type { Place } from "@/modules/Traffic/types";

export type PopularPlace = Place & {
  id: string;
  icon: "plane" | "museum" | "beach" | "lake" | "medina" | "port" | "city";
};

export const POPULAR_PLACES: PopularPlace[] = [
  { id: "airport", name: "Tunis-Carthage Airport", lat: 36.851, lng: 10.2272, icon: "plane" },
  { id: "medina", name: "Medina of Tunis", lat: 36.7992, lng: 10.17, icon: "medina" },
  { id: "bardo", name: "Bardo Museum", lat: 36.8094, lng: 10.1342, icon: "museum" },
  { id: "lac", name: "Lac de Tunis", lat: 36.8327, lng: 10.2336, icon: "lake" },
  { id: "marsa", name: "La Marsa Beach", lat: 36.8784, lng: 10.3248, icon: "beach" },
  { id: "goulette", name: "La Goulette", lat: 36.8185, lng: 10.305, icon: "port" },
  { id: "ariana", name: "Ariana", lat: 36.8625, lng: 10.1935, icon: "city" },
  { id: "manouba", name: "Manouba", lat: 36.8081, lng: 10.0983, icon: "city" },
];
