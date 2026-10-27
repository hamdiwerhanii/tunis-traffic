"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { favoritesApi } from "@/modules/Traffic/api/traffic.api";
import type { Favorite, LatLng } from "@/modules/Traffic/types";
import { isSamePlace } from "@/modules/Traffic/utils/geo";

const FAVORITES_KEY = ["favorites"] as const;

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: FAVORITES_KEY, queryFn: favoritesApi.list });

  const add = useMutation({
    mutationFn: favoritesApi.add,
    onSuccess: (favorite) =>
      queryClient.setQueryData<Favorite[]>(FAVORITES_KEY, (current = []) => [favorite, ...current]),
  });

  const remove = useMutation({
    mutationFn: favoritesApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const previous = queryClient.getQueryData<Favorite[]>(FAVORITES_KEY);
      queryClient.setQueryData<Favorite[]>(FAVORITES_KEY, (current = []) =>
        current.filter((favorite) => favorite.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(FAVORITES_KEY, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });

  const favorites = query.data ?? [];

  return {
    favorites,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    add,
    remove,
    isFavorite: (point: LatLng) => favorites.some((favorite) => isSamePlace(favorite, point)),
  };
};
