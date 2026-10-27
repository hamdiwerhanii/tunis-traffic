import type { TrafficLevel } from "@/modules/Traffic/types";

export const TUNIS_TIME_ZONE = "Africa/Tunis";

export const PEAK_TIMES = [
  { label: "Morning rush", start: "07:30", end: "09:00" },
  { label: "Evening rush", start: "16:30", end: "18:30" },
] as const;

export const NEAR_PEAK_MINUTES = 30;

export const TRAFFIC_LEVELS: Record<
  TrafficLevel,
  { label: string; description: string; color: string }
> = {
  low: {
    label: "Light traffic",
    description: "Roads are usually clear at this time.",
    color: "#22c55e",
  },
  medium: {
    label: "Moderate traffic",
    description: "Traffic usually builds up around now.",
    color: "#f59e0b",
  },
  heavy: {
    label: "Heavy traffic",
    description: "Rush hour: expect delays on main roads.",
    color: "#ef4444",
  },
};
