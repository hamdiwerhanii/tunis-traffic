"use client";

import { Clock, TriangleAlert } from "lucide-react";

import { PEAK_TIMES, TRAFFIC_LEVELS } from "@/modules/Traffic/constants/traffic";
import { useTrafficStatus } from "@/modules/Traffic/hooks/useTrafficStatus";
import { useTypicalTraffic } from "@/modules/Traffic/hooks/useTypicalTraffic";

const LIVE_LEGEND = [
  { label: "Free flow", color: "#22c55e" },
  { label: "Slow", color: "#f59e0b" },
  { label: "Jam", color: "#ef4444" },
];

const TrafficStatus = () => {
  const traffic = useTypicalTraffic();
  const { liveTraffic } = useTrafficStatus();

  if (!traffic) {
    return <div className="h-11 animate-pulse rounded-lg bg-white/5" aria-hidden />;
  }

  const level = TRAFFIC_LEVELS[traffic.level];

  return (
    <section aria-labelledby="traffic-status-title" className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="traffic-pulse size-3 shrink-0 rounded-full"
          style={{ backgroundColor: level.color }}
        />
        <div className="min-w-0">
          <h2 id="traffic-status-title" className="text-sm font-semibold" style={{ color: level.color }}>
            {level.label}
            <span className="sr-only"> in Tunis right now</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {traffic.isPeak ? `${traffic.peakLabel} until ${traffic.peakEnd}` : traffic.nextPeak}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-lg:hidden">
        {traffic.isPeak && (
          <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <TriangleAlert aria-hidden className="size-4 shrink-0 text-red-300" />
            {level.description}
          </p>
        )}

        <ul className="grid grid-cols-2 gap-2" aria-label="Usual rush hours on weekdays">
          {PEAK_TIMES.map((peak) => (
            <li key={peak.label} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <Clock aria-hidden className="size-3.5 shrink-0 text-amber-300" />
              <span>
                <span className="block text-[11px] text-muted-foreground">{peak.label}</span>
                <span className="block text-xs font-medium tabular-nums">
                  {peak.start}–{peak.end}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {liveTraffic ? (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground" aria-label="Live traffic colors">
            {LIVE_LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Estimated from usual rush hours. The live traffic layer appears when the server has a
            TomTom API key.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrafficStatus;
