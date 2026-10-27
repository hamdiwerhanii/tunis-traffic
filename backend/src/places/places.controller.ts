import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SearchPlacesQueryDto } from './dto/search-places.query.dto.js';
import { PlaceResponseDto } from './dto/place-response.dto.js';
import { PlacesService } from './places.service.js';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @ApiOperation({ summary: 'Search streets and places in Tunisia (OpenStreetMap Nominatim)' })
  @ApiServiceUnavailableResponse({ description: 'The place search provider is unreachable' })
  search(@Query() query: SearchPlacesQueryDto): Promise<PlaceResponseDto[]> {
    return this.placesService.search(query.q);
  }
}
