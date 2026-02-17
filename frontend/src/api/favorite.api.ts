import { apiClient } from "./api.client";

export type FavoritePlace = {
    _id: string;
    name: string;
    address?: string;
    lat: number;
    lng: number;
    sessionId: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateFavoritePayload = {
    name: string;
    address?: string;
    lat: number;
    lng: number;
    sessionId: string;
};

export const favoriteApi = {
    getFavorites: async (sessionId: string): Promise<FavoritePlace[]> => {
        return apiClient.get<FavoritePlace[]>(
            `/favorite?sessionId=${encodeURIComponent(sessionId)}`
        );
    },

    addFavorite: async (
        data: CreateFavoritePayload
    ): Promise<FavoritePlace> => {
        return apiClient.post<FavoritePlace>("/favorite", data);
    },

    removeFavorite: async (
        id: string,
        sessionId: string
    ): Promise<FavoritePlace> => {
        return apiClient.delete<FavoritePlace>(
            `/favorite/${id}?sessionId=${encodeURIComponent(sessionId)}`
        );
    },
};
