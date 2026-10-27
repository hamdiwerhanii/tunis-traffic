"use client";

import { useMutation } from "@tanstack/react-query";

import { isMobileLayout } from "@/lib/media";
import { routesApi } from "@/modules/Traffic/api/traffic.api";
import { useMapStore } from "@/modules/Traffic/store/map.store";

export const useRoutePlan = () => {
  const setRoute = useMapStore((state) => state.setRoute);
  const setPanelOpen = useMapStore((state) => state.setPanelOpen);

  return useMutation({
    mutationFn: routesApi.plan,
    onMutate: () => setRoute(null),
    onSuccess: (route, request) => {
      setRoute({ ...route, scheduled: Boolean(request.arriveAt) });
      if (isMobileLayout()) setPanelOpen(false);
    },
  });
};
