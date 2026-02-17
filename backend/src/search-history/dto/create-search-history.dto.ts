import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSearchHistoryDto {
    @ApiProperty({
        example: 'Avenue Habib Bourguiba',
        description: 'The search query text',
    })
    @IsNotEmpty()
    @IsString()
    query: string;

    @ApiProperty({
        example: 'Avenue Habib Bourguiba, Tunis',
        description: 'Resolved place name',
        required: false,
    })
    @IsOptional()
    @IsString()
    placeName?: string;

    @ApiProperty({
        example: 36.7999,
        description: 'Latitude of the searched place',
    })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({
        example: 10.1801,
        description: 'Longitude of the searched place',
    })
    @IsNotEmpty()
    @IsNumber()
    lng: number;

    @ApiProperty({
        example: 'a1b2c3d4-uuid-session',
        description: 'Anonymous session ID',
    })
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}
