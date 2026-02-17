import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service.js';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { Favorite } from './schema/favorite.schema.js';

@ApiTags('favorite')
@Controller('favorite')
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    @Post()
    @ApiOperation({ summary: 'Add a place to favorites' })
    @ApiBody({ type: CreateFavoriteDto })
    @ApiResponse({ status: 201, description: 'Favorite created successfully' })
    @ApiResponse({ status: 400, description: 'Duplicate or bad request' })
    async create(@Body() createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
        return this.favoriteService.create(createFavoriteDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all favorites for a session' })
    @ApiQuery({
        name: 'sessionId',
        required: true,
        description: 'Anonymous session ID',
    })
    @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
    async findBySession(
        @Query('sessionId') sessionId: string,
    ): Promise<Favorite[]> {
        return this.favoriteService.findBySession(sessionId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a favorite place' })
    @ApiParam({ name: 'id', description: 'Favorite ID' })
    @ApiQuery({
        name: 'sessionId',
        required: true,
        description: 'Anonymous session ID',
    })
    @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
    @ApiResponse({ status: 404, description: 'Favorite not found' })
    async remove(
        @Param('id') id: string,
        @Query('sessionId') sessionId: string,
    ): Promise<Favorite> {
        return this.favoriteService.remove(id, sessionId);
    }
}
