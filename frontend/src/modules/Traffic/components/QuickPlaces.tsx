"use client";

import { Building2, Castle, Landmark, type LucideIcon, Plane, Ship, TreePalm, Waves } from "lucide-react";

import { POPULAR_PLACES, type PopularPlace } from "@/modules/Traffic/constants/places";
import { useMapStore } from "@/modules/Traffic/store/map.store";

const ICONS: Record<PopularPlace["icon"], LucideIcon> = {
  plane: Plane,
  medina: Castle,
  museum: Landmark,
  lake: Waves,
  beach: TreePalm,
  port: Ship,
  city: Building2,
};

const QuickPlaces = () => {
  const selectPlace = useMapStore((state) => state.selectPlace);

  return (
    <nav aria-label="Popular places">
      <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {POPULAR_PLACES.map((place) => {
          const Icon = ICONS[place.icon];
          return (
            <li key={place.id} className="shrink-0">
              <button
                type="button"
                onClick={() => selectPlace(place)}
                className="panel flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium text-foreground/90 hover:bg-card hover:text-foreground"
              >
                <Icon aria-hidden className="size-3.5 text-primary" />
                {place.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default QuickPlaces;
