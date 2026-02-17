"use client";

import { FC, useState } from "react";
import { Star, StarOff, Loader2, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { favoriteApi, FavoritePlace } from "@/api/favorite.api";
import useSessionId from "@/shared/hooks/useSessionId";
import { cn } from "@/lib/utils";

type FavoritesPanelProps = {
    onPanToPlace?: (lat: number, lng: number, name?: string) => void;
};

const FavoritesPanel: FC<FavoritesPanelProps> = ({ onPanToPlace }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const queryClient = useQueryClient();
    const sessionId = useSessionId();

    const {
        data: favorites = [],
        isLoading,
    } = useQuery({
        queryKey: ["favorites", sessionId],
        queryFn: () => favoriteApi.getFavorites(sessionId),
        enabled: !!sessionId,
        staleTime: 30_000,
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => favoriteApi.removeFavorite(id, sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites", sessionId] });
        },
    });

    if (!sessionId) return null;

    return (
        <div className="glass floating-panel rounded-xl overflow-hidden">
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-foreground">
                        Favorites
                    </span>
                    {favorites.length > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-white/10 rounded-full px-1.5 py-0.5">
                            {favorites.length}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                )}
            </button>

            {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5 max-h-40 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : favorites.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground text-center py-2">
                            No favorites yet. Search a place and add it!
                        </p>
                    ) : (
                        favorites.map((fav: FavoritePlace) => (
                            <div
                                key={fav._id}
                                className="flex items-center justify-between group rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors"
                            >
                                <button
                                    onClick={() => onPanToPlace?.(fav.lat, fav.lng, fav.name)}
                                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {fav.name}
                                        </p>
                                        {fav.address && (
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {fav.address}
                                            </p>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => removeMutation.mutate(fav._id)}
                                    disabled={removeMutation.isPending}
                                    className={cn(
                                        "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                                        "hover:bg-red-500/20"
                                    )}
                                    title="Remove from favorites"
                                >
                                    <StarOff className="w-3 h-3 text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FavoritesPanel;
