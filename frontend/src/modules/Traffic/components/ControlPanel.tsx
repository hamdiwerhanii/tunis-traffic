"use client";

import { ChevronUp, History, Navigation, Star } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

import { cn } from "@/lib/cn";
import PlaceCard from "@/modules/Traffic/components/PlaceCard";
import RecentSearches from "@/modules/Traffic/components/RecentSearches";
import SavedPlaces from "@/modules/Traffic/components/SavedPlaces";
import TrafficStatus from "@/modules/Traffic/components/TrafficStatus";
import TripPlanner from "@/modules/Traffic/components/TripPlanner";
import { useTrafficStatus } from "@/modules/Traffic/hooks/useTrafficStatus";
import { useMapStore } from "@/modules/Traffic/store/map.store";
import type { PanelTab } from "@/modules/Traffic/types";
import { formatClock, formatDuration } from "@/modules/Traffic/utils/time";

const TABS: { id: PanelTab; label: string; icon: ReactNode }[] = [
  { id: "trip", label: "Plan trip", icon: <Navigation aria-hidden className="size-3.5" /> },
  { id: "saved", label: "Saved", icon: <Star aria-hidden className="size-3.5" /> },
  { id: "recent", label: "Recent", icon: <History aria-hidden className="size-3.5" /> },
];

const PANELS: Record<PanelTab, () => ReactNode> = {
  trip: () => <TripPlanner />,
  saved: () => <SavedPlaces />,
  recent: () => <RecentSearches />,
};

const ControlPanel = () => {
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeTab = useMapStore((state) => state.activeTab);
  const setActiveTab = useMapStore((state) => state.setActiveTab);
  const isOpen = useMapStore((state) => state.isPanelOpen);
  const setPanelOpen = useMapStore((state) => state.setPanelOpen);
  const route = useMapStore((state) => state.route);
  const { liveTraffic } = useTrafficStatus();

  const onTabKeyDown = (event: KeyboardEvent, index: number) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: TABS.length - 1 - index };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (index + moves[event.key] + TABS.length) % TABS.length;
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      aria-label="Traffic tools"
      className="pointer-events-auto relative flex flex-col lg:min-h-0 lg:flex-1"
    >
      <PlaceCard
        className={cn(
          "absolute inset-x-0 bottom-full mb-3 lg:inset-x-auto lg:bottom-0 lg:left-full lg:mb-0 lg:ml-4 lg:w-96",
          isOpen && "max-lg:hidden",
        )}
      />

      <div className="panel flex flex-col overflow-hidden rounded-2xl lg:min-h-0 lg:flex-1">
        <button
          type="button"
          onClick={() => setPanelOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`${id}-body`}
          className="flex w-full cursor-pointer items-center justify-center gap-1 py-1.5 text-[11px] text-muted-foreground hover:text-foreground lg:hidden"
        >
          <ChevronUp aria-hidden className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
          {isOpen ? "Hide panel" : "Show panel"}
        </button>

        <div className="border-b border-border px-4 pb-3 lg:pt-4">
          <TrafficStatus />
        </div>

        {route && !isOpen && (
          <button
            type="button"
            onClick={() => {
              setActiveTab("trip");
              setPanelOpen(true);
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-border bg-primary/10 px-4 py-2.5 text-left text-sm lg:hidden"
          >
            <span>
              <span className="font-semibold text-primary">
                Leave {route.scheduled ? `at ${formatClock(route.departAt)}` : "now"}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {formatDuration(route.durationMinutes)} · {route.distanceKm} km
              </span>
            </span>
            <span className="text-xs text-muted-foreground">Details</span>
          </button>
        )}

        <div
          role="tablist"
          aria-label="Panel sections"
          className="flex gap-1 border-b border-border px-2 py-2"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${id}-body`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              onClick={() => {
                setActiveTab(tab.id);
                setPanelOpen(true);
              }}
              className={cn(
                "flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`${id}-body`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${activeTab}`}
          className={cn(
            "overflow-y-auto overscroll-contain p-4 max-lg:max-h-[46dvh] lg:min-h-0 lg:flex-1",
            !isOpen && "max-lg:hidden",
          )}
        >
          {PANELS[activeTab]()}
        </div>

        <p className="px-4 pb-2 text-[10px] text-muted-foreground lg:hidden">
          Map &copy; OpenStreetMap contributors{liveTraffic ? " · Traffic © TomTom" : ""}
        </p>
      </div>
    </section>
  );
};

export default ControlPanel;
