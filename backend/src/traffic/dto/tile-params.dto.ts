import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

export const TRAFFIC_LAYERS = ['flow', 'incidents'] as const;
export type TrafficLayer = (typeof TRAFFIC_LAYERS)[number];

export const MIN_TILE_ZOOM = 6;
export const MAX_TILE_ZOOM = 18;

export class TileParamsDto {
  @ApiProperty({ enum: TRAFFIC_LAYERS })
  @IsIn(TRAFFIC_LAYERS)
  layer: TrafficLayer;

  @ApiProperty({ minimum: MIN_TILE_ZOOM, maximum: MAX_TILE_ZOOM, example: 13 })
  @Type(() => Number)
  @IsInt()
  @Min(MIN_TILE_ZOOM)
  @Max(MAX_TILE_ZOOM)
  z: number;

  @ApiProperty({ example: 4466 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  x: number;

  @ApiProperty({ example: 3226 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  y: number;
}
