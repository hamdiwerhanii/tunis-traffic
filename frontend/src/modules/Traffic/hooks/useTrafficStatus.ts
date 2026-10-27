"use client";

import { useQuery } from "@tanstack/react-query";

import { trafficApi } from "@/modules/Traffic/api/traffic.api";

export const useTrafficStatus = () => {
  const query = useQuery({
    queryKey: ["traffic-status"],
    queryFn: trafficApi.status,
    staleTime: Infinity,
  });

  return { liveTraffic: query.data?.liveTraffic ?? false, isLoading: query.isLoading };
};
