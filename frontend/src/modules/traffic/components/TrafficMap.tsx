"use client";

import { FC, useRef, useEffect } from "react";

import { useLeafletMap } from "@/shared/hooks/useLeafletMap";

type TrafficMapProps = {
    onMapReady: (helpers: ReturnType<typeof useLeafletMap>) => void;
};

const TrafficMap: FC<TrafficMapProps> = ({ onMapReady }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const helpers = useLeafletMap();
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (mapContainerRef.current && !hasInitialized.current) {
            hasInitialized.current = true;
            helpers.initMap(mapContainerRef.current).then(() => {
                onMapReady(helpers);
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapContainerRef}
                className="map-container h-full w-full"
                id="traffic-map"
            />

            {/* Loading state */}
            {!helpers.isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        </div>
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrafficMap;
