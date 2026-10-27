"use client";

import { Star, Trash2 } from "lucide-react";

import PlaceList from "@/modules/Traffic/components/PlaceList";
import { useFavorites } from "@/modules/Traffic/hooks/useFavorites";
import { useMapStore } from "@/modules/Traffic/store/map.store";

const SavedPlaces = () => {
  const { favorites, isLoading, isError, refetch, remove } = useFavorites();
  const selectPlace = useMapStore((state) => state.selectPlace);

  return (
    <PlaceList
      isLoading={isLoading}
      isError={isError}
      isEmpty={favorites.length === 0}
      errorText="Your saved places could not be loaded."
      onRetry={() => void refetch()}
      empty={
        <>
          No saved places yet.
          <br />
          Search a place and press <strong className="text-foreground">Save place</strong>.
        </>
      }
    >
      {favorites.map((favorite) => (
        <li key={favorite.id} className="flex items-center gap-1 rounded-lg hover:bg-white/5">
          <button
            type="button"
            onClick={() => selectPlace(favorite)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-2.5 py-2 text-left"
          >
            <Star aria-hidden className="size-4 shrink-0 text-amber-300" />
            <span className="min-w-0">
              <span className="block truncate text-sm">{favorite.name}</span>
              {favorite.address && (
                <span className="block truncate text-xs text-muted-foreground">{favorite.address}</span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => remove.mutate(favorite.id)}
            aria-label={`Remove ${favorite.name} from saved places`}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-red-500/15 hover:text-red-300"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </li>
      ))}
    </PlaceList>
  );
};

export default SavedPlaces;
