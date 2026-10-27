import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsTunisiaLatitude, IsTunisiaLongitude } from '../../common/validation/coordinates.js';
import { Trim } from '../../common/validation/trim.js';

export class RecordSearchDto {
  @ApiProperty({ example: 'Avenue Habib Bourguiba', maxLength: 200 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  query: string;

  @ApiPropertyOptional({ example: 'Avenue Habib Bourguiba, Tunis', maxLength: 300 })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300)
  placeName?: string;

  @ApiProperty({ example: 36.7999 })
  @IsTunisiaLatitude()
  lat: number;

  @ApiProperty({ example: 10.1801 })
  @IsTunisiaLongitude()
  lng: number;
}
