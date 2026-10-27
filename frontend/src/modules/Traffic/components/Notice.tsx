"use client";

import { CircleAlert, Info, X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { useMapStore } from "@/modules/Traffic/store/map.store";

const AUTO_HIDE_MS = 6000;

const Notice = () => {
  const notice = useMapStore((state) => state.notice);
  const dismiss = useMapStore((state) => state.dismissNotice);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-3 top-3 z-[600] flex justify-center lg:left-[calc(400px+2rem)]">
      {notice && (
        <p
          key={notice.key}
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "panel pointer-events-auto flex max-w-md animate-slide-down items-start gap-2.5 rounded-xl px-4 py-3 text-sm",
            notice.tone === "error" && "border-red-400/40",
          )}
        >
          {notice.tone === "error" ? (
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-red-300" />
          ) : (
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-sky-300" />
          )}
          <span className="flex-1">{notice.text}</span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss message"
            className="-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X aria-hidden className="size-4" />
          </button>
        </p>
      )}
    </div>
  );
};

export default Notice;
