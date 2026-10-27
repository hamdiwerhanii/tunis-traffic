import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_HISTORY = 20;

export class ListHistoryQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: MAX_HISTORY, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HISTORY)
  limit = 10;
}
