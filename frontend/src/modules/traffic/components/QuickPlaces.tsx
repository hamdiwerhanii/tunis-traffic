"use client";

import { FC } from "react";
import { MapPin, Plane, Building, TreePalm, Waves, Castle } from "lucide-react";

import { POPULAR_PLACES } from "@/shared/constants/trafficConstants";
import { cn } from "@/lib/utils";

type QuickPlacesProps = {
    onPanToPlace: (lat: number, lng: number, name?: string) => void;
};

const iconMap: Record<string, FC<{ className?: string }>> = {
    "Tunis-Carthage Airport": Plane,
    "Bardo Museum": Building,
    "La Marsa Beach": TreePalm,
    "Lac de Tunis": Waves,
    "Medina of Tunis": Castle,
};

const QuickPlaces: FC<QuickPlacesProps> = ({ onPanToPlace }) => {
    return (
        <div className="glass floating-panel rounded-xl p-3 animate-slide-up w-full">
            <p className="text-[11px] text-muted-foreground mb-2 px-1">
                Quick Access
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {POPULAR_PLACES.slice(0, 5).map((place) => {
                    const Icon = iconMap[place.name] || MapPin;
                    return (
                        <button
                            key={place.name}
                            onClick={() => onPanToPlace(place.lat, place.lng, place.name)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]",
                                "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                                "transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer",
                                "border border-transparent hover:border-border"
                            )}
                        >
                            <Icon className="w-3 h-3" />
                            {place.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickPlaces;
