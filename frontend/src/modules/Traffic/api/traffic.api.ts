import { apiClient } from "@/lib/api-client";
import type {
  Favorite,
  Place,
  PlaceResult,
  RoutePlan,
  RouteRequest,
  SearchEntry,
} from "@/modules/Traffic/types";

export const favoritesApi = {
  list: () => apiClient.get<Favorite[]>("/favorites"),
  add: (place: Place) =>
    apiClient.post<Favorite>("/favorites", {
      name: place.name.slice(0, 120),
      address: place.address?.slice(0, 300) || undefined,
      lat: place.lat,
      lng: place.lng,
    }),
  remove: (id: string) => apiClient.delete(`/favorites/${encodeURIComponent(id)}`),
};

export const historyApi = {
  list: () => apiClient.get<SearchEntry[]>("/search-history?limit=10"),
  record: (query: string, place: Place) =>
    apiClient.post<SearchEntry>("/search-history", {
      query: query.slice(0, 200),
      placeName: place.name.slice(0, 300),
      lat: place.lat,
      lng: place.lng,
    }),
  clear: () => apiClient.delete("/search-history"),
};

export const placesApi = {
  search: (query: string, signal?: AbortSignal) =>
    apiClient.get<PlaceResult[]>(`/places?q=${encodeURIComponent(query)}`, signal),
};

export const routesApi = {
  plan: ({ from, to, arriveAt }: RouteRequest) => {
    const params = new URLSearchParams({
      fromLat: String(from.lat),
      fromLng: String(from.lng),
      toLat: String(to.lat),
      toLng: String(to.lng),
    });
    if (arriveAt) params.set("arriveAt", arriveAt.toISOString());
    return apiClient.get<RoutePlan>(`/routes?${params.toString()}`);
  },
};

export const trafficApi = {
  status: () => apiClient.get<{ liveTraffic: boolean }>("/traffic/status"),
};
