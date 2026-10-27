import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TtlCache } from '../common/cache/ttl-cache.js';
import { tileIntersectsTunisia } from '../common/geo/tunisia.js';
import { fetchBuffer } from '../common/http/fetch-upstream.js';
import { AppConfigService } from '../config/app-config.service.js';
import { TileParamsDto, TrafficLayer } from './dto/tile-params.dto.js';

const TILE_CACHE_TTL_MS = 60 * 1000;

const tileUrl = (layer: TrafficLayer, z: number, x: number, y: number, key: string) =>
  layer === 'flow'
    ? `https://api.tomtom.com/traffic/map/4/tile/flow/relative/${z}/${x}/${y}.png?key=${key}&tileSize=256&thickness=10`
    : `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/${z}/${x}/${y}.png?key=${key}&tileSize=256`;

@Injectable()
export class TrafficService {
  private readonly tiles = new TtlCache<Buffer>(TILE_CACHE_TTL_MS, 400);

  constructor(private readonly config: AppConfigService) {}

  get liveTraffic(): boolean {
    return Boolean(this.config.tomtomApiKey);
  }

  async tile({ layer, z, x, y }: TileParamsDto): Promise<Buffer> {
    const key = this.config.tomtomApiKey;
    if (!key) throw new NotFoundException('Live traffic is not configured on this server');

    const size = 2 ** z;
    if (x >= size || y >= size) throw new BadRequestException('Tile coordinates are out of range');
    if (!tileIntersectsTunisia(z, x, y))
      throw new NotFoundException('Tiles are only served for Tunisia');

    const cacheKey = `${layer}/${z}/${x}/${y}`;
    const cached = this.tiles.get(cacheKey);
    if (cached) return cached;

    const tile = await fetchBuffer(tileUrl(layer, z, x, y, key), { service: 'Live traffic' });
    this.tiles.set(cacheKey, tile);
    return tile;
  }
}
