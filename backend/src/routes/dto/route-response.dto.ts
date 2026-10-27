import { ApiProperty } from '@nestjs/swagger';

export const ROUTE_PROVIDERS = ['tomtom', 'osrm'] as const;
export type RouteProvider = (typeof ROUTE_PROVIDERS)[number];

export class RouteResponseDto {
  @ApiProperty({ enum: ROUTE_PROVIDERS })
  provider: RouteProvider;

  @ApiProperty({ description: 'True when the duration includes live traffic' })
  liveTraffic: boolean;

  distanceKm: number;
  durationMinutes: number;

  @ApiProperty({ description: 'Extra minutes caused by traffic (0 without live traffic)' })
  delayMinutes: number;

  departAt: string;
  arriveAt: string;

  @ApiProperty({
    description: 'Route geometry as [lat, lng] pairs',
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
  })
  path: [number, number][];
}
