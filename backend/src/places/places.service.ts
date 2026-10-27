import { Injectable } from '@nestjs/common';
import { TtlCache } from '../common/cache/ttl-cache.js';
import { TUNISIA_BOUNDS } from '../common/geo/tunisia.js';
import { fetchJson } from '../common/http/fetch-upstream.js';
import { AppConfigService } from '../config/app-config.service.js';
import { PlaceResponseDto } from './dto/place-response.dto.js';

type NominatimPlace = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_INTERVAL_MS = 1100;

@Injectable()
export class PlacesService {
  private readonly cache = new TtlCache<PlaceResponseDto[]>(CACHE_TTL_MS, 500);
  private queue: Promise<void> = Promise.resolve();
  private lastCallAt = 0;

  constructor(private readonly config: AppConfigService) {}

  async search(query: string): Promise<PlaceResponseDto[]> {
    const key = query.toLowerCase().replace(/\s+/g, ' ');
    const cached = this.cache.get(key);
    if (cached) return cached;

    await this.waitForTurn();

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      countrycodes: 'tn',
      limit: '6',
      'accept-language': 'en',
      viewbox: `${TUNISIA_BOUNDS.minLng},${TUNISIA_BOUNDS.maxLat},${TUNISIA_BOUNDS.maxLng},${TUNISIA_BOUNDS.minLat}`,
    });
    const results = await fetchJson<NominatimPlace[]>(
      `${this.config.nominatimUrl}/search?${params.toString()}`,
      { service: 'Place search', headers: { 'User-Agent': this.config.userAgent } },
    );

    const places = results.map((place): PlaceResponseDto => ({
      id: String(place.place_id),
      name: place.name || place.display_name.split(',')[0].trim(),
      address: place.display_name,
      lat: Number(place.lat),
      lng: Number(place.lon),
    }));

    this.cache.set(key, places);
    return places;
  }

  private waitForTurn(): Promise<void> {
    const turn = this.queue.then(async () => {
      const wait = this.lastCallAt + MIN_INTERVAL_MS - Date.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      this.lastCallAt = Date.now();
    });
    this.queue = turn.catch(() => undefined);
    return turn;
  }
}
