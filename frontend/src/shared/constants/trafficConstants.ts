import { PeakTimeSlot, TrafficInfo } from "@/types";

// Tunis default center coordinates (Avenue Habib Bourguiba)
export const TUNIS_CENTER = {
    lat: 36.8065,
    lng: 10.1815,
};

export const DEFAULT_ZOOM = 13;

export const TRAFFIC_LEVELS: Record<string, TrafficInfo> = {
    low: {
        level: "low",
        label: "Low Traffic",
        emoji: "🟢",
        color: "#22c55e",
        description: "Roads are clear. Good time to drive!",
    },
    medium: {
        level: "medium",
        label: "Moderate Traffic",
        emoji: "🟠",
        color: "#f59e0b",
        description: "Some congestion on main roads.",
    },
    heavy: {
        level: "heavy",
        label: "Heavy Traffic",
        emoji: "🔴",
        color: "#ef4444",
        description: "Significant delays expected. Consider alternatives.",
    },
    unknown: {
        level: "unknown",
        label: "Unknown",
        emoji: "⚪",
        color: "#94a3b8",
        description: "Traffic data unavailable.",
    },
};

export const PEAK_TIMES: PeakTimeSlot[] = [
    {
        label: "Morning Rush",
        start: "07:30",
        end: "09:00",
        period: "morning",
    },
    {
        label: "Evening Rush",
        start: "16:30",
        end: "18:30",
        period: "evening",
    },
];

// Popular destinations in Tunis for quick access
export const POPULAR_PLACES = [
    { name: "Tunis-Carthage Airport", lat: 36.8510, lng: 10.2272 },
    { name: "Bardo Museum", lat: 36.8094, lng: 10.1342 },
    { name: "La Marsa Beach", lat: 36.8784, lng: 10.3248 },
    { name: "Lac de Tunis", lat: 36.7977, lng: 10.2216 },
    { name: "Medina of Tunis", lat: 36.7992, lng: 10.1700 },
    { name: "La Goulette", lat: 36.8185, lng: 10.3050 },
    { name: "Ariana", lat: 36.8625, lng: 10.1935 },
    { name: "Manouba", lat: 36.8081, lng: 10.0983 },
];
