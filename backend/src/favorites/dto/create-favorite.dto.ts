import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsTunisiaLatitude, IsTunisiaLongitude } from '../../common/validation/coordinates.js';
import { Trim } from '../../common/validation/trim.js';

export class CreateFavoriteDto {
  @ApiProperty({ example: 'Tunis-Carthage Airport', maxLength: 120 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Tunis-Carthage International Airport, Tunis', maxLength: 300 })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiProperty({ example: 36.851 })
  @IsTunisiaLatitude()
  lat: number;

  @ApiProperty({ example: 10.2272 })
  @IsTunisiaLongitude()
  lng: number;
}
