"use client";

import { Check, LoaderCircle, MapPin, Navigation, Star, X } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import Button from "@/shared/components/Button";
import { useFavorites } from "@/modules/Traffic/hooks/useFavorites";
import { useMapStore } from "@/modules/Traffic/store/map.store";

type PlaceCardProps = {
  className?: string;
};

const PlaceCard = ({ className }: PlaceCardProps) => {
  const place = useMapStore((state) => state.selectedPlace);
  const selectPlace = useMapStore((state) => state.selectPlace);
  const planTripTo = useMapStore((state) => state.planTripTo);
  const { add, isFavorite } = useFavorites();

  if (!place) return null;

  const isSaved = isFavorite(place);
  const errorMessage =
    add.error instanceof ApiError && add.error.status === 409
      ? "This place is already saved."
      : add.isError
        ? "Could not save this place. Try again."
        : null;

  return (
    <section
      aria-label={`Selected place: ${place.name}`}
      className={cn("panel animate-slide-up rounded-xl p-3.5", className)}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15">
          <MapPin aria-hidden className="size-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{place.name}</h2>
          {place.address && <p className="line-clamp-2 text-xs text-muted-foreground">{place.address}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            add.reset();
            selectPlace(null);
          }}
          aria-label="Close place details"
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {isSaved ? (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-xs font-medium text-emerald-300">
            <Check aria-hidden className="size-3.5" />
            Saved
          </span>
        ) : (
          <Button variant="favorite" size="sm" onClick={() => add.mutate(place)} disabled={add.isPending}>
            {add.isPending ? (
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <Star aria-hidden className="size-3.5" />
            )}
            Save place
          </Button>
        )}
        <Button size="sm" onClick={() => planTripTo(place)}>
          <Navigation aria-hidden className="size-3.5" />
          Plan a trip here
        </Button>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {errorMessage}
        </p>
      )}
    </section>
  );
};

export default PlaceCard;
