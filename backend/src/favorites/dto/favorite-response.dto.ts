import type { Favorite } from '../favorite.schema.js';

export class FavoriteResponseDto {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  createdAt: string;
}

export const toFavoriteResponse = (favorite: Favorite & { _id: unknown }): FavoriteResponseDto => ({
  id: String(favorite._id),
  name: favorite.name,
  address: favorite.address ?? null,
  lat: favorite.lat,
  lng: favorite.lng,
  createdAt: favorite.createdAt.toISOString(),
});
