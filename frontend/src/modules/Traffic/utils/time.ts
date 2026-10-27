import { TUNIS_TIME_ZONE } from "@/modules/Traffic/constants/traffic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const tunisFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TUNIS_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const tunisTime = (date: Date): { minutes: number; weekday: number } => {
  const parts = Object.fromEntries(
    tunisFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    weekday: WEEKDAYS.indexOf(parts.weekday),
  };
};

export const formatClock = (value: string | Date): string =>
  clockFormatter.format(typeof value === "string" ? new Date(value) : value);

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")} min`;
};

export const timeAgo = (iso: string, now: Date = new Date()): string => {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

export const nextArrival = (time: string, now: Date = new Date()): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const arrival = new Date(now);
  arrival.setHours(hours, minutes, 0, 0);
  if (arrival.getTime() <= now.getTime() + 60_000) arrival.setDate(arrival.getDate() + 1);
  return arrival;
};
