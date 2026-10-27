import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Types } from 'mongoose';
import { SessionId } from '../common/session/session-id.decorator.js';
import { SESSION_COOKIE } from '../common/session/session.middleware.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { FavoriteResponseDto } from './dto/favorite-response.dto.js';
import { FavoritesService } from './favorites.service.js';

@ApiTags('favorites')
@ApiCookieAuth(SESSION_COOKIE)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List the favorite places of the current browser session' })
  list(@SessionId() sessionId: string): Promise<FavoriteResponseDto[]> {
    return this.favoritesService.list(sessionId);
  }

  @Post()
  @ApiOperation({ summary: 'Save a place as a favorite' })
  @ApiBadRequestResponse({ description: 'Invalid place or favorite limit reached' })
  @ApiConflictResponse({ description: 'The place is already a favorite' })
  create(
    @SessionId() sessionId: string,
    @Body() dto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.create(sessionId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove one of your favorite places' })
  @ApiNoContentResponse({ description: 'Favorite removed' })
  @ApiNotFoundResponse({ description: 'No favorite with this id in your session' })
  remove(
    @SessionId() sessionId: string,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<void> {
    return this.favoritesService.remove(sessionId, id);
  }
}
