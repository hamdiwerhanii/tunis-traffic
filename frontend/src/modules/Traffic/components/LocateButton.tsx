"use client";

import { LoaderCircle, LocateFixed } from "lucide-react";

import { cn } from "@/lib/cn";
import { useGeolocation } from "@/modules/Traffic/hooks/useGeolocation";

type LocateButtonProps = {
  className?: string;
};

const LocateButton = ({ className }: LocateButtonProps) => {
  const { locate, isLocating } = useGeolocation();

  return (
    <button
      type="button"
      onClick={locate}
      disabled={isLocating}
      aria-label={isLocating ? "Finding your location" : "Show my location"}
      title="Show my location"
      className={cn(
        "panel pointer-events-auto grid size-12 cursor-pointer place-items-center rounded-xl text-foreground hover:bg-card disabled:cursor-wait",
        className,
      )}
    >
      {isLocating ? (
        <LoaderCircle aria-hidden className="size-5 animate-spin" />
      ) : (
        <LocateFixed aria-hidden className="size-5" />
      )}
    </button>
  );
};

export default LocateButton;
