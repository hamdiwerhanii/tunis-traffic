"use client";

import { TrafficCone } from "lucide-react";

import ControlPanel from "@/modules/Traffic/components/ControlPanel";
import LocateButton from "@/modules/Traffic/components/LocateButton";
import Notice from "@/modules/Traffic/components/Notice";
import QuickPlaces from "@/modules/Traffic/components/QuickPlaces";
import SearchBox from "@/modules/Traffic/components/SearchBox";
import TrafficMap from "@/modules/Traffic/components/TrafficMap";

const TrafficDashboard = () => (
  <main className="relative h-dvh w-full overflow-hidden">
    <h1 className="sr-only">Tunis Traffic: live traffic map and departure planner</h1>
    <TrafficMap />
    <Notice />

    <div className="pointer-events-none absolute inset-0 z-[500] flex flex-col justify-between gap-3 p-3 lg:p-4">
      <div className="contents lg:flex lg:min-h-0 lg:w-[400px] lg:flex-1 lg:flex-col lg:gap-3">
        <div className="pointer-events-auto space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="panel flex h-12 flex-1 items-center gap-2.5 rounded-xl px-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <TrafficCone aria-hidden className="size-4 text-white" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">Tunis Traffic</span>
                <span className="block text-[11px] text-muted-foreground">Check before you drive</span>
              </span>
            </div>
            <LocateButton />
          </div>
          <SearchBox />
          <QuickPlaces />
        </div>

        <ControlPanel />
      </div>
    </div>
  </main>
);

export default TrafficDashboard;
