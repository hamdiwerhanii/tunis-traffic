import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
    @ApiProperty({
        example: 'Tunis-Carthage Airport',
        description: 'Name of the favorite place',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Tunis Carthage International Airport, Tunisia',
        description: 'Address of the place',
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        example: 36.851,
        description: 'Latitude coordinate',
    })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({
        example: 10.2272,
        description: 'Longitude coordinate',
    })
    @IsNotEmpty()
    @IsNumber()
    lng: number;

    @ApiProperty({
        example: 'a1b2c3d4-uuid-session',
        description: 'Anonymous session ID from localStorage',
    })
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}
