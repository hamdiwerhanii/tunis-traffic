import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs));
};

export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

export const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}min`;
};
