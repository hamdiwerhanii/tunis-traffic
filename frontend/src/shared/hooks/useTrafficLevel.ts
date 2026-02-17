"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { TrafficInfo, TrafficLevel } from "@/types";
import {
    TRAFFIC_LEVELS,
    PEAK_TIMES,
} from "@/shared/constants/trafficConstants";

export const useTrafficLevel = (): {
    currentLevel: TrafficInfo;
    isPeakTime: boolean;
    currentPeakLabel: string | null;
    nextPeakTime: string | null;
    getEstimatedLevel: () => TrafficLevel;
} => {
    const [currentTimeMinutes, setCurrentTimeMinutes] = useState(-1);
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [currentHour, setCurrentHour] = useState(12);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            setCurrentTimeMinutes(h * 60 + m);
            setCurrentHour(h);
            setDayOfWeek(now.getDay());
        };
        update();

        // Update every minute
        const interval = setInterval(update, 60_000);
        return () => clearInterval(interval);
    }, []);

    const isPeakTime = useMemo(() => {
        if (currentTimeMinutes < 0) return false;
        return PEAK_TIMES.some((slot) => {
            const [startH, startM] = slot.start.split(":").map(Number);
            const [endH, endM] = slot.end.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
        });
    }, [currentTimeMinutes]);

    const currentPeakLabel = useMemo(() => {
        if (currentTimeMinutes < 0) return null;
        const peakSlot = PEAK_TIMES.find((slot) => {
            const [startH, startM] = slot.start.split(":").map(Number);
            const [endH, endM] = slot.end.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
        });
        return peakSlot?.label ?? null;
    }, [currentTimeMinutes]);

    const nextPeakTime = useMemo(() => {
        if (currentTimeMinutes < 0) return null;
        for (const slot of PEAK_TIMES) {
            const [startH, startM] = slot.start.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            if (currentTimeMinutes < startMinutes) {
                return `${slot.label} starts at ${slot.start}`;
            }
        }
        return "Next peak: Tomorrow 07:30";
    }, [currentTimeMinutes]);

    const getEstimatedLevel = useCallback((): TrafficLevel => {
        if (currentTimeMinutes < 0) return "unknown";

        // Weekend check (Saturday = 6, Sunday = 0)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) return "low";

        // Peak time heavy
        if (isPeakTime) return "heavy";

        // Near peak = medium
        const nearPeakTimes = PEAK_TIMES.some((slot) => {
            const [startH, startM] = slot.start.split(":").map(Number);
            const [endH, endM] = slot.end.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            return (
                (currentTimeMinutes >= startMinutes - 30 &&
                    currentTimeMinutes < startMinutes) ||
                (currentTimeMinutes > endMinutes &&
                    currentTimeMinutes <= endMinutes + 30)
            );
        });

        if (nearPeakTimes) return "medium";

        // Late night = low
        if (currentHour >= 22 || currentHour < 6) return "low";

        // Daytime = low-medium
        return "low";
    }, [currentTimeMinutes, dayOfWeek, isPeakTime, currentHour]);

    const estimatedLevel = getEstimatedLevel();
    const currentLevel = TRAFFIC_LEVELS[estimatedLevel];

    return {
        currentLevel,
        isPeakTime,
        currentPeakLabel,
        nextPeakTime,
        getEstimatedLevel,
    };
};

