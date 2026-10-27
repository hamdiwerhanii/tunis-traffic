import type { SearchEntry } from '../search-entry.schema.js';

export class SearchEntryResponseDto {
  id: string;
  query: string;
  placeName: string | null;
  lat: number;
  lng: number;
  searchedAt: string;
}

export const toSearchEntryResponse = (
  entry: SearchEntry & { _id: unknown },
): SearchEntryResponseDto => ({
  id: String(entry._id),
  query: entry.query,
  placeName: entry.placeName ?? null,
  lat: entry.lat,
  lng: entry.lng,
  searchedAt: entry.searchedAt.toISOString(),
});
