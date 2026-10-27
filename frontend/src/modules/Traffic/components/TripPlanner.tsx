"use client";

import { Crosshair, LoaderCircle, Navigation, RotateCcw } from "lucide-react";
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";

import { ApiError } from "@/lib/api-client";
import { prefersReducedMotion } from "@/lib/media";
import Button from "@/shared/components/Button";
import { POPULAR_PLACES } from "@/modules/Traffic/constants/places";
import { useFavorites } from "@/modules/Traffic/hooks/useFavorites";
import { useGeolocation } from "@/modules/Traffic/hooks/useGeolocation";
import { useRoutePlan } from "@/modules/Traffic/hooks/useRoutePlan";
import { useMapStore } from "@/modules/Traffic/store/map.store";
import type { Place } from "@/modules/Traffic/types";
import { formatClock, formatDuration, nextArrival } from "@/modules/Traffic/utils/time";

const placeKey = (place: Place) => `${place.lat.toFixed(5)},${place.lng.toFixed(5)}`;

const TripPlanner = () => {
  const id = useId();
  const [arriveBy, setArriveBy] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const userLocation = useMapStore((state) => state.userLocation);
  const destination = useMapStore((state) => state.destination);
  const selectedPlace = useMapStore((state) => state.selectedPlace);
  const route = useMapStore((state) => state.route);
  const setDestination = useMapStore((state) => state.setDestination);
  const setRoute = useMapStore((state) => state.setRoute);
  const { favorites } = useFavorites();
  const { locate, isLocating } = useGeolocation();
  const plan = useRoutePlan();
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!route) return;
    resultRef.current?.scrollIntoView?.({
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [route]);

  const options = useMemo(() => {
    const groups: { label: string; places: Place[] }[] = [];
    const seen = new Set<string>();
    const unique = (places: Place[]) =>
      places.filter((place) => {
        const key = placeKey(place);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const current = unique([destination, selectedPlace].filter((place): place is Place => Boolean(place)));
    if (current.length) groups.push({ label: "Selected", places: current });
    const saved = unique(favorites);
    if (saved.length) groups.push({ label: "Saved places", places: saved });
    groups.push({ label: "Popular places", places: unique(POPULAR_PLACES) });
    return groups;
  }, [destination, selectedPlace, favorites]);

  const byKey = useMemo(
    () => new Map(options.flatMap((group) => group.places.map((place) => [placeKey(place), place]))),
    [options],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!userLocation) return setFormError("Share your location first so the trip has a starting point.");
    if (!destination) return setFormError("Choose where you want to go.");

    setFormError(null);
    plan.mutate({
      from: userLocation,
      to: destination,
      arriveAt: arriveBy ? nextArrival(arriveBy) : undefined,
    });
  };

  const planError = plan.isError
    ? plan.error instanceof ApiError && plan.error.status === 400
      ? plan.error.message
      : "The route could not be planned right now. Try again in a moment."
    : null;

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-muted-foreground">From</span>
          {userLocation ? (
            <p className="flex h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-sm">
              <span aria-hidden className="size-2.5 rounded-full bg-sky-400" />
              Your current location
            </p>
          ) : (
            <Button variant="outline" className="w-full" onClick={locate} disabled={isLocating}>
              {isLocating ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              ) : (
                <Crosshair aria-hidden className="size-4" />
              )}
              {isLocating ? "Finding your location…" : "Use my location"}
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${id}-destination`} className="block text-xs font-medium text-muted-foreground">
            To
          </label>
          <select
            id={`${id}-destination`}
            value={destination ? placeKey(destination) : ""}
            onChange={(event) => setDestination(byKey.get(event.target.value) ?? null)}
            className="field h-10 w-full rounded-lg px-3 text-sm"
          >
            <option value="" disabled>
              Choose a destination
            </option>
            {options.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.places.map((place) => (
                  <option key={placeKey(place)} value={placeKey(place)}>
                    {place.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${id}-arrive`} className="block text-xs font-medium text-muted-foreground">
            Arrive by <span className="font-normal">(optional)</span>
          </label>
          <input
            id={`${id}-arrive`}
            type="time"
            value={arriveBy}
            onChange={(event) => setArriveBy(event.target.value)}
            aria-describedby={`${id}-arrive-hint`}
            className="field h-10 w-full rounded-lg px-3 text-sm tabular-nums"
          />
          <p id={`${id}-arrive-hint`} className="text-[11px] text-muted-foreground">
            Leave empty to leave now.
          </p>
        </div>

        {(formError || planError) && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {formError ?? planError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={plan.isPending}>
          {plan.isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Navigation aria-hidden className="size-4" />
          )}
          {plan.isPending ? "Planning…" : "When should I leave?"}
        </Button>
      </form>

      {route && (
        <section ref={resultRef} aria-label="Trip result" aria-live="polite" className="animate-slide-up space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-background/60 p-2.5">
              <dt className="text-[11px] text-muted-foreground">Leave at</dt>
              <dd className="text-xl font-bold tabular-nums text-primary">
                {route.scheduled ? formatClock(route.departAt) : "Now"}
              </dd>
            </div>
            <div className="rounded-lg bg-background/60 p-2.5">
              <dt className="text-[11px] text-muted-foreground">Arrive around</dt>
              <dd className="text-xl font-bold tabular-nums">{formatClock(route.arriveAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Drive time</dt>
              <dd className="text-sm font-medium">{formatDuration(route.durationMinutes)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Distance</dt>
              <dd className="text-sm font-medium">{route.distanceKm} km</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            {route.liveTraffic
              ? route.delayMinutes > 0
                ? `Traffic adds about ${route.delayMinutes} min to this trip.`
                : "No traffic delay on this route right now."
              : "Estimate without live traffic. Leave a little earlier at rush hour."}
          </p>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setRoute(null)}>
            <RotateCcw aria-hidden className="size-3.5" />
            Clear route
          </Button>
        </section>
      )}
    </div>
  );
};

export default TripPlanner;
