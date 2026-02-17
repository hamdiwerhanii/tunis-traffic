export type TrafficLevel = "low" | "medium" | "heavy" | "unknown";

export type TrafficInfo = {
    level: TrafficLevel;
    label: string;
    emoji: string;
    color: string;
    description: string;
};

export type PeakTimeSlot = {
    label: string;
    start: string;
    end: string;
    period: "morning" | "evening";
};

export type DepartureEstimate = {
    departureTime: string;
    travelDuration: string;
    travelDurationValue: number;
    distance: string;
    arrivalTime: string;
    trafficCondition: string;
};

export type MapPosition = {
    lat: number;
    lng: number;
};

export type SearchResult = {
    name: string;
    address: string;
    position: MapPosition;
};
