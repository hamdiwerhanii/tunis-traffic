"use client";

import { FC, useRef, useCallback } from "react";
import { Star, X, MapPin, Loader2, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { favoriteApi } from "@/api/favorite.api";
import { searchHistoryApi } from "@/api/search-history.api";
import useSessionId from "@/shared/hooks/useSessionId";
import useMapStore from "@/shared/store/mapStore";
import { cn } from "@/lib/utils";

const PlaceActionBar: FC = () => {
    const { selectedPlace, setSelectedPlace } = useMapStore();
    const queryClient = useQueryClient();
    const sessionId = useSessionId();
    const lastRecordedRef = useRef<string | null>(null);

    // Check if this place is already in favorites
    const { data: favorites = [] } = useQuery({
        queryKey: ["favorites", sessionId],
        queryFn: () => favoriteApi.getFavorites(sessionId),
        enabled: !!sessionId,
        staleTime: 30_000,
    });

    const isAlreadyFavorite = selectedPlace
        ? favorites.some(
            (f) =>
                Math.abs(f.lat - selectedPlace.lat) < 0.0001 &&
                Math.abs(f.lng - selectedPlace.lng) < 0.0001
        )
        : false;

    // Add to favorites mutation
    const addFavMutation = useMutation({
        mutationFn: () => {
            if (!selectedPlace) throw new Error("No place selected");
            return favoriteApi.addFavorite({
                name: selectedPlace.name,
                address: selectedPlace.address || undefined,
                lat: selectedPlace.lat,
                lng: selectedPlace.lng,
                sessionId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["favorites", sessionId],
            });
        },
    });

    // Record search history mutation
    const recordSearchMutation = useMutation({
        mutationFn: (place: { name: string; lat: number; lng: number }) => {
            return searchHistoryApi.recordSearch({
                query: place.name,
                placeName: place.name,
                lat: place.lat,
                lng: place.lng,
                sessionId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["search-history", sessionId],
            });
        },
    });

    // Auto-record search when a new place is selected
    const placeKey = selectedPlace
        ? `${selectedPlace.lat}-${selectedPlace.lng}`
        : null;

    if (placeKey && lastRecordedRef.current !== placeKey && selectedPlace) {
        lastRecordedRef.current = placeKey;
        recordSearchMutation.mutate({
            name: selectedPlace.name,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
        });
    }

    const handleDismiss = useCallback(() => {
        setSelectedPlace(null);
        addFavMutation.reset();
    }, [setSelectedPlace, addFavMutation]);

    if (!selectedPlace || !sessionId) return null;

    return (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="glass floating-panel rounded-xl px-4 py-3 animate-slide-up max-w-md w-full pointer-events-auto">
                <div className="flex items-center gap-3">
                    {/* Place Info */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                                {selectedPlace.name}
                            </p>
                            {selectedPlace.address && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {selectedPlace.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isAlreadyFavorite || addFavMutation.isSuccess ? (
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-[11px]">
                                <Check className="w-3 h-3" />
                                <span>Saved</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => addFavMutation.mutate()}
                                disabled={addFavMutation.isPending}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer",
                                    "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
                                    "border border-yellow-500/20 hover:border-yellow-500/40"
                                )}
                            >
                                {addFavMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Star className="w-3 h-3" />
                                )}
                                <span>Favorite</span>
                            </button>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                            title="Dismiss"
                        >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Error feedback */}
                {addFavMutation.isError && (
                    <p className="text-[10px] text-red-400 mt-1.5">
                        {addFavMutation.error?.message || "Failed to add favorite"}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PlaceActionBar;
