import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SessionId } from '../common/session/session-id.decorator.js';
import { SESSION_COOKIE } from '../common/session/session.middleware.js';
import { ListHistoryQueryDto } from './dto/list-history.query.dto.js';
import { RecordSearchDto } from './dto/record-search.dto.js';
import { SearchEntryResponseDto } from './dto/search-entry-response.dto.js';
import { SearchHistoryService } from './search-history.service.js';

@ApiTags('search-history')
@ApiCookieAuth(SESSION_COOKIE)
@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'List the recent searches of the current browser session' })
  list(
    @SessionId() sessionId: string,
    @Query() query: ListHistoryQueryDto,
  ): Promise<SearchEntryResponseDto[]> {
    return this.searchHistoryService.list(sessionId, query.limit);
  }

  @Post()
  @ApiOperation({ summary: 'Record a searched place (repeated places move to the top)' })
  @ApiCreatedResponse({ type: SearchEntryResponseDto })
  record(
    @SessionId() sessionId: string,
    @Body() dto: RecordSearchDto,
  ): Promise<SearchEntryResponseDto> {
    return this.searchHistoryService.record(sessionId, dto);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear the search history of the current browser session' })
  @ApiNoContentResponse({ description: 'History cleared' })
  clear(@SessionId() sessionId: string): Promise<void> {
    return this.searchHistoryService.clear(sessionId);
  }
}
