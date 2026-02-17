"use client";

import { FC, useState, useCallback } from "react";
import { Crosshair, Loader2, MapPin } from "lucide-react";

import TrafficMap from "@/modules/traffic/components/TrafficMap";
import SearchBar from "@/modules/traffic/components/SearchBar";
import TrafficStatusPanel from "@/modules/traffic/components/TrafficStatusPanel";
import DepartureHelper from "@/modules/traffic/components/DepartureHelper";
import QuickPlaces from "@/modules/traffic/components/QuickPlaces";
import FavoritesPanel from "@/modules/traffic/components/FavoritesPanel";
import SearchHistoryPanel from "@/modules/traffic/components/SearchHistoryPanel";
import PlaceActionBar from "@/modules/traffic/components/PlaceActionBar";
import { Button } from "@/shared/components";
import { useLeafletMap } from "@/shared/hooks/useLeafletMap";
import useMapStore from "@/shared/store/mapStore";

const TrafficDashboard: FC = () => {
    const [mapHelpers, setMapHelpers] =
        useState<ReturnType<typeof useLeafletMap> | null>(null);
    const { isLocating } = useMapStore();

    const handleMapReady = useCallback(
        (helpers: ReturnType<typeof useLeafletMap>) => {
            setMapHelpers(helpers);
        },
        []
    );

    const isMapReady = mapHelpers !== null;

    const handlePanToPlace = useCallback(
        (lat: number, lng: number, name?: string) => {
            mapHelpers?.panToPlace(lat, lng, name);
        },
        [mapHelpers]
    );

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            {/* Full-screen Map */}
            <div className="absolute inset-0 z-0">
                <TrafficMap onMapReady={handleMapReady} />
            </div>

            {/* Top Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    {/* Logo & Title */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 glass rounded-xl px-4 py-2.5 floating-panel">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold gradient-text leading-tight">
                                    Tunis Traffic
                                </h1>
                                <p className="text-[10px] text-muted-foreground">
                                    Quick Check
                                </p>
                            </div>
                        </div>

                        {/* My Location Button */}
                        <Button
                            onClick={() => mapHelpers?.locateUser()}
                            disabled={!isMapReady || isLocating}
                            variant="default"
                            size="sm"
                            className="glass floating-panel border-0 gap-1.5"
                            id="my-location-btn"
                        >
                            {isLocating ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span className="hidden sm:inline">Locating...</span>
                                </>
                            ) : (
                                <>
                                    <Crosshair className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">My Location</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <SearchBar
                        searchPlace={mapHelpers?.searchPlace ?? (async () => [])}
                        selectSearchResult={mapHelpers?.selectSearchResult ?? (() => { })}
                        isMapReady={isMapReady}
                    />

                    {/* Quick Places + Favorites + History Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <QuickPlaces onPanToPlace={handlePanToPlace} />
                        <FavoritesPanel onPanToPlace={handlePanToPlace} />
                        <SearchHistoryPanel onPanToPlace={handlePanToPlace} />
                    </div>
                </div>
            </div>

            {/* Bottom Panels */}
            <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
                <div className="max-w-3xl mx-auto relative">
                    {/* Place Action Bar */}
                    <PlaceActionBar />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Traffic Status */}
                        <TrafficStatusPanel />

                        {/* Departure Helper */}
                        <DepartureHelper
                            onCalculateRoute={(origin, dest, time) =>
                                mapHelpers?.calculateRoute(origin, dest, time) ??
                                Promise.resolve(null)
                            }
                            onClearRoute={() => mapHelpers?.clearRoute()}
                            onPanToPlace={handlePanToPlace}
                            isMapReady={isMapReady}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficDashboard;
