"use client";

import { FC, useState } from "react";
import {
    Clock,
    ChevronDown,
    ChevronUp,
    Trash2,
    MapPin,
    Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { searchHistoryApi, SearchHistoryEntry } from "@/api/search-history.api";
import useSessionId from "@/shared/hooks/useSessionId";

type SearchHistoryPanelProps = {
    onPanToPlace?: (lat: number, lng: number, name?: string) => void;
};

const SearchHistoryPanel: FC<SearchHistoryPanelProps> = ({ onPanToPlace }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const queryClient = useQueryClient();
    const sessionId = useSessionId();

    const { data: history = [], isLoading } = useQuery({
        queryKey: ["search-history", sessionId],
        queryFn: () => searchHistoryApi.getHistory(sessionId, 10),
        enabled: !!sessionId,
        staleTime: 30_000,
    });

    const clearMutation = useMutation({
        mutationFn: () => searchHistoryApi.clearHistory(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["search-history", sessionId],
            });
        },
    });

    if (!sessionId) return null;

    const formatTimeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="glass floating-panel rounded-xl overflow-hidden">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsExpanded((prev) => !prev); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-foreground">
                        Recent Searches
                    </span>
                    {history.length > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-white/10 rounded-full px-1.5 py-0.5">
                            {history.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {isExpanded && history.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearMutation.mutate();
                            }}
                            disabled={clearMutation.isPending}
                            className="p-1 rounded-md hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Clear all history"
                        >
                            <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 space-y-1 max-h-40 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground text-center py-2">
                            No recent searches. Try searching for a place!
                        </p>
                    ) : (
                        history.map((entry: SearchHistoryEntry) => (
                            <button
                                key={entry._id}
                                onClick={() =>
                                    onPanToPlace?.(
                                        entry.lat,
                                        entry.lng,
                                        entry.placeName || entry.query
                                    )
                                }
                                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-xs text-foreground truncate">
                                        {entry.placeName || entry.query}
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                    {formatTimeAgo(entry.createdAt)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchHistoryPanel;
