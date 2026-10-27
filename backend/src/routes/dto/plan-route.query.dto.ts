import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';
import { IsTunisiaLatitude, IsTunisiaLongitude } from '../../common/validation/coordinates.js';

export class PlanRouteQueryDto {
  @ApiProperty({ example: 36.8065 })
  @IsTunisiaLatitude()
  fromLat: number;

  @ApiProperty({ example: 10.1815 })
  @IsTunisiaLongitude()
  fromLng: number;

  @ApiProperty({ example: 36.851 })
  @IsTunisiaLatitude()
  toLat: number;

  @ApiProperty({ example: 10.2272 })
  @IsTunisiaLongitude()
  toLng: number;

  @ApiPropertyOptional({
    example: '2026-10-23T08:30:00+01:00',
    description: 'Desired arrival time. Leave empty to leave now.',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  arriveAt?: string;
}
