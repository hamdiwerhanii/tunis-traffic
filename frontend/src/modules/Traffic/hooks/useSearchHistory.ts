"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { historyApi } from "@/modules/Traffic/api/traffic.api";
import type { Place, SearchEntry } from "@/modules/Traffic/types";

const HISTORY_KEY = ["search-history"] as const;

export const useSearchHistory = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: HISTORY_KEY, queryFn: historyApi.list });

  const record = useMutation({
    mutationFn: ({ query: text, place }: { query: string; place: Place }) =>
      historyApi.record(text, place),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY }),
  });

  const clear = useMutation({
    mutationFn: historyApi.clear,
    onSuccess: () => queryClient.setQueryData<SearchEntry[]>(HISTORY_KEY, []),
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    record,
    clear,
  };
};
