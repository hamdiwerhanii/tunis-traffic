"use client";

import { useEffect, useState } from "react";

import type { TypicalTraffic } from "@/modules/Traffic/types";
import { getTypicalTraffic } from "@/modules/Traffic/utils/traffic-level";

const REFRESH_MS = 60_000;

export const useTypicalTraffic = (): TypicalTraffic | null => {
  const [traffic, setTraffic] = useState<TypicalTraffic | null>(null);

  useEffect(() => {
    const update = () => setTraffic(getTypicalTraffic(new Date()));
    update();
    const timer = setInterval(update, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return traffic;
};
