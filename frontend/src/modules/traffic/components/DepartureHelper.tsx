"use client";

import { FC, useState, useCallback } from "react";
import {
    Navigation,
    Clock,
    MapPin,
    ArrowRight,
    RotateCcw,
    Loader2,
} from "lucide-react";

import { Button } from "@/shared/components";
import { POPULAR_PLACES } from "@/shared/constants/trafficConstants";
import useMapStore from "@/shared/store/mapStore";
import { cn } from "@/lib/utils";

type RouteApiResult = {
    durationText: string;
    durationMinutes: number;
    distanceText: string;
};

type DepartureHelperProps = {
    onCalculateRoute: (
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number },
        arrivalTime?: Date
    ) => Promise<RouteApiResult | null>;
    onClearRoute: () => void;
    onPanToPlace: (lat: number, lng: number, name?: string) => void;
    isMapReady: boolean;
};

type RouteResult = {
    duration: string;
    distance: string;
    departureTime: string;
    durationMinutes: number;
};

const DepartureHelper: FC<DepartureHelperProps> = ({
    onCalculateRoute,
    onClearRoute,
    onPanToPlace,
    isMapReady,
}) => {
    const { userLocation } = useMapStore();
    const [selectedDestination, setSelectedDestination] = useState<string | null>(
        null
    );
    const [arrivalTime, setArrivalTime] = useState("");
    const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(async () => {
        if (!userLocation) {
            setError('Click "My Location" first to set your starting point.');
            return;
        }
        if (!selectedDestination) {
            setError("Please select a destination.");
            return;
        }

        const dest = POPULAR_PLACES.find((p) => p.name === selectedDestination);
        if (!dest) return;

        setIsCalculating(true);
        setError(null);

        const desiredArrival = arrivalTime
            ? (() => {
                const [h, m] = arrivalTime.split(":").map(Number);
                const arrival = new Date();
                arrival.setHours(h, m, 0, 0);
                if (arrival < new Date()) arrival.setDate(arrival.getDate() + 1);
                return arrival;
            })()
            : undefined;

        const result = await onCalculateRoute(
            userLocation,
            { lat: dest.lat, lng: dest.lng },
            desiredArrival
        );

        if (result) {
            let departureTimeStr = "Now";
            if (desiredArrival) {
                const departDate = new Date(
                    desiredArrival.getTime() - result.durationMinutes * 60 * 1000
                );
                departureTimeStr = departDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            }

            setRouteResult({
                duration: result.durationText,
                distance: result.distanceText,
                departureTime: departureTimeStr,
                durationMinutes: result.durationMinutes,
            });
        } else {
            setError("Could not calculate route. Try again.");
        }

        setIsCalculating(false);
    }, [
        userLocation,
        selectedDestination,
        arrivalTime,
        onCalculateRoute,
    ]);

    const handleReset = () => {
        setRouteResult(null);
        setSelectedDestination(null);
        setArrivalTime("");
        setError(null);
        onClearRoute();
    };

    return (
        <div className="glass floating-panel rounded-xl p-4 animate-slide-up w-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold">When Should I Leave?</h3>
                </div>
                {routeResult && (
                    <button
                        onClick={handleReset}
                        className="p-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                )}
            </div>

            {!routeResult ? (
                <div className="space-y-3">
                    {/* Origin indicator */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">
                            {userLocation
                                ? "Your current location"
                                : 'Click "My Location" to set start'}
                        </span>
                    </div>

                    {/* Destination selector */}
                    <div>
                        <label className="text-[11px] text-muted-foreground mb-1.5 block">
                            Destination
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {POPULAR_PLACES.map((place) => (
                                <button
                                    key={place.name}
                                    onClick={() => {
                                        setSelectedDestination(place.name);
                                        onPanToPlace(place.lat, place.lng, place.name);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] transition-all cursor-pointer",
                                        selectedDestination === place.name
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-transparent"
                                    )}
                                >
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{place.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Arrival time */}
                    <div>
                        <label className="text-[11px] text-muted-foreground mb-1.5 block">
                            Desired arrival time (optional)
                        </label>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="time"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="flex-1 bg-white/5 border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                id="arrival-time-input"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-[11px] text-red-400 bg-red-400/10 rounded-md px-3 py-1.5">
                            {error}
                        </p>
                    )}

                    {/* Calculate button */}
                    <Button
                        onClick={handleCalculate}
                        disabled={!isMapReady || isCalculating}
                        className="w-full"
                        size="sm"
                    >
                        {isCalculating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                                Calculate Route
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                /* Route Result */
                <div className="space-y-3 animate-slide-down">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Your Location</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-foreground font-medium">
                            {selectedDestination}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary/10 rounded-lg px-3 py-2.5 text-center">
                            <p className="text-[10px] text-primary/70 mb-0.5">Leave at</p>
                            <p className="text-lg font-bold text-primary">
                                {routeResult.departureTime}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg px-3 py-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground mb-0.5">
                                Distance
                            </p>
                            <p className="text-lg font-bold">{routeResult.distance}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center bg-white/5 rounded-lg px-3 py-2">
                        <div>
                            <p className="text-[10px] text-muted-foreground">
                                Estimated Duration
                            </p>
                            <p className="text-xs font-medium">{routeResult.duration}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                    >
                        <RotateCcw className="w-3 h-3 mr-1.5" />
                        New Route
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DepartureHelper;
