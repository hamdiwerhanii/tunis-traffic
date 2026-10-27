import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { TUNISIA_BOUNDS } from '../geo/tunisia.js';

const finiteNumber = { allowNaN: false, allowInfinity: false };

export const IsTunisiaLatitude = () =>
  applyDecorators(
    Type(() => Number),
    IsNumber(finiteNumber),
    Min(TUNISIA_BOUNDS.minLat, { message: '$property must be inside Tunisia' }),
    Max(TUNISIA_BOUNDS.maxLat, { message: '$property must be inside Tunisia' }),
  );

export const IsTunisiaLongitude = () =>
  applyDecorators(
    Type(() => Number),
    IsNumber(finiteNumber),
    Min(TUNISIA_BOUNDS.minLng, { message: '$property must be inside Tunisia' }),
    Max(TUNISIA_BOUNDS.maxLng, { message: '$property must be inside Tunisia' }),
  );
