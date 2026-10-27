import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/validation/trim.js';

export class SearchPlacesQueryDto {
  @ApiProperty({ example: 'Bardo', minLength: 2, maxLength: 100 })
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q: string;
}
