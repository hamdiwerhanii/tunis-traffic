import { NEAR_PEAK_MINUTES, PEAK_TIMES } from "@/modules/Traffic/constants/traffic";
import type { TypicalTraffic } from "@/modules/Traffic/types";
import { toMinutes, tunisTime } from "@/modules/Traffic/utils/time";

const FIRST_PEAK = PEAK_TIMES[0];
const isWeekend = (weekday: number) => weekday === 0 || weekday === 6;

const nextPeakText = (minutes: number, weekday: number): string => {
  if (!isWeekend(weekday)) {
    const upcoming = PEAK_TIMES.find((peak) => minutes < toMinutes(peak.start));
    if (upcoming) return `${upcoming.label} starts at ${upcoming.start}`;
  }

  const tomorrow = (weekday + 1) % 7;
  const day = isWeekend(tomorrow) ? "Monday" : "tomorrow";
  return `Next rush hour: ${day} at ${FIRST_PEAK.start}`;
};

export const getTypicalTraffic = (date: Date): TypicalTraffic => {
  const { minutes, weekday } = tunisTime(date);
  const quiet = { isPeak: false, peakLabel: null, peakEnd: null, nextPeak: nextPeakText(minutes, weekday) };

  if (isWeekend(weekday)) return { level: "low", ...quiet };

  const current = PEAK_TIMES.find(
    (peak) => minutes >= toMinutes(peak.start) && minutes <= toMinutes(peak.end),
  );
  if (current) {
    return { ...quiet, level: "heavy", isPeak: true, peakLabel: current.label, peakEnd: current.end };
  }

  const nearPeak = PEAK_TIMES.some((peak) => {
    const start = toMinutes(peak.start);
    const end = toMinutes(peak.end);
    return (
      (minutes >= start - NEAR_PEAK_MINUTES && minutes < start) ||
      (minutes > end && minutes <= end + NEAR_PEAK_MINUTES)
    );
  });

  return { level: nearPeak ? "medium" : "low", ...quiet };
};
