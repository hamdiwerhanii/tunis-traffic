"use client";

import { History } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/shared/components/Button";
import PlaceList from "@/modules/Traffic/components/PlaceList";
import { useSearchHistory } from "@/modules/Traffic/hooks/useSearchHistory";
import { useMapStore } from "@/modules/Traffic/store/map.store";
import { timeAgo } from "@/modules/Traffic/utils/time";

const RecentSearches = () => {
  const { history, isLoading, isError, refetch, clear } = useSearchHistory();
  const selectPlace = useMapStore((state) => state.selectPlace);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-2">
      <PlaceList
        isLoading={isLoading}
        isError={isError}
        isEmpty={history.length === 0}
        errorText="Your recent searches could not be loaded."
        onRetry={() => void refetch()}
        empty="Places you search for will show up here."
      >
        {history.map((entry) => {
          const name = entry.placeName ?? entry.query;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => selectPlace({ name, lat: entry.lat, lng: entry.lng })}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-white/5"
              >
                <History aria-hidden className="size-4 shrink-0 text-sky-300" />
                <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
                <time dateTime={entry.searchedAt} className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(entry.searchedAt, now)}
                </time>
              </button>
            </li>
          );
        })}
      </PlaceList>

      {history.length > 0 &&
        (confirming ? (
          <div className="flex items-center justify-end gap-2" role="group" aria-label="Confirm clearing history">
            <span className="text-xs text-muted-foreground">Clear all recent searches?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-500/80 hover:bg-red-500"
              disabled={clear.isPending}
              onClick={() => clear.mutate(undefined, { onSettled: () => setConfirming(false) })}
            >
              Clear
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              Clear history
            </Button>
          </div>
        ))}
    </div>
  );
};

export default RecentSearches;
