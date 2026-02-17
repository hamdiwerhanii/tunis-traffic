"use client";

import { FC, useState, useRef, useCallback } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";

import { useLeafletMap } from "@/shared/hooks/useLeafletMap";
import { cn } from "@/lib/utils";

type SearchResult = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
};

type SearchBarProps = {
    searchPlace: ReturnType<typeof useLeafletMap>["searchPlace"];
    selectSearchResult: ReturnType<typeof useLeafletMap>["selectSearchResult"];
    isMapReady: boolean;
};

const SearchBar: FC<SearchBarProps> = ({ searchPlace, selectSearchResult, isMapReady }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            if (value.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            debounceRef.current = setTimeout(async () => {
                setIsSearching(true);
                const searchResults = await searchPlace(value);
                setResults(searchResults);
                setShowResults(searchResults.length > 0);
                setIsSearching(false);
            }, 400);
        },
        [searchPlace]
    );

    const handleSelectResult = useCallback(
        (result: SearchResult) => {
            selectSearchResult(result);
            setQuery(result.display_name.split(",")[0]);
            setShowResults(false);
            setResults([]);
        },
        [selectSearchResult]
    );

    const handleClear = useCallback(() => {
        setQuery("");
        setResults([]);
        setShowResults(false);
    }, []);

    return (
        <div className="relative" id="search-bar">
            <div className="glass floating-panel rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5">
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                    ) : (
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => results.length > 0 && setShowResults(true)}
                        placeholder="Search streets, places in Tunis..."
                        disabled={!isMapReady}
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                        id="search-input"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 glass floating-panel rounded-xl overflow-hidden animate-slide-up">
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        {results.map((result) => (
                            <button
                                key={result.place_id}
                                onClick={() => handleSelectResult(result)}
                                className={cn(
                                    "w-full px-4 py-2.5 flex items-center gap-2.5 text-left",
                                    "hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                                )}
                            >
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {result.display_name.split(",")[0]}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {result.display_name.split(",").slice(1, 3).join(",")}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
