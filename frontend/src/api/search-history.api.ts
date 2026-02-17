import { apiClient } from "./api.client";

export type SearchHistoryEntry = {
    _id: string;
    query: string;
    placeName?: string;
    lat: number;
    lng: number;
    sessionId: string;
    createdAt: string;
};

export type CreateSearchHistoryPayload = {
    query: string;
    placeName?: string;
    lat: number;
    lng: number;
    sessionId: string;
};

export const searchHistoryApi = {
    getHistory: async (
        sessionId: string,
        limit: number = 10
    ): Promise<SearchHistoryEntry[]> => {
        return apiClient.get<SearchHistoryEntry[]>(
            `/search-history?sessionId=${encodeURIComponent(sessionId)}&limit=${limit}`
        );
    },

    recordSearch: async (
        data: CreateSearchHistoryPayload
    ): Promise<SearchHistoryEntry> => {
        return apiClient.post<SearchHistoryEntry>("/search-history", data);
    },

    clearHistory: async (
        sessionId: string
    ): Promise<{ deletedCount: number }> => {
        return apiClient.delete<{ deletedCount: number }>(
            `/search-history?sessionId=${encodeURIComponent(sessionId)}`
        );
    },
};
