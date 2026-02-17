import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SearchHistoryService } from './search-history.service.js';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto.js';
import { SearchHistory } from './schema/search-history.schema.js';

@ApiTags('search-history')
@Controller('search-history')
export class SearchHistoryController {
  constructor(
    private readonly searchHistoryService: SearchHistoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Record a search in history' })
  @ApiBody({ type: CreateSearchHistoryDto })
  @ApiResponse({ status: 201, description: 'Search recorded successfully' })
  async create(
    @Body() createSearchHistoryDto: CreateSearchHistoryDto,
  ): Promise<SearchHistory> {
    return this.searchHistoryService.create(createSearchHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get search history for a session' })
  @ApiQuery({
    name: 'sessionId',
    required: true,
    description: 'Anonymous session ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of entries to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search history retrieved successfully',
  })
  async findBySession(
    @Query('sessionId') sessionId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<SearchHistory[]> {
    return this.searchHistoryService.findBySession(sessionId, limit);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all search history for a session' })
  @ApiQuery({
    name: 'sessionId',
    required: true,
    description: 'Anonymous session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Search history cleared successfully',
  })
  async clearBySession(
    @Query('sessionId') sessionId: string,
  ): Promise<{ deletedCount: number }> {
    return this.searchHistoryService.clearBySession(sessionId);
  }
}
