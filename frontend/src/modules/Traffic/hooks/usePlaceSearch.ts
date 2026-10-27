"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { placesApi } from "@/modules/Traffic/api/traffic.api";

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export const usePlaceSearch = (term: string) => {
  const query = useDebouncedValue(term.trim(), DEBOUNCE_MS);
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: ["places", query.toLowerCase()],
    queryFn: ({ signal }) => placesApi.search(query, signal),
    enabled,
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    query,
    places: enabled ? (result.data ?? []) : [],
    isSearching: enabled && result.isFetching,
    isError: enabled && result.isError,
    isSettled: enabled && !result.isFetching && query === term.trim(),
  };
};
