import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PlanRouteQueryDto } from './dto/plan-route.query.dto.js';
import { RouteResponseDto } from './dto/route-response.dto.js';
import { RoutesService } from './routes.service.js';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Plan a car route in Tunisia and tell when to leave',
    description:
      'Uses TomTom live traffic when TOMTOM_API_KEY is set, otherwise OSRM without traffic.',
  })
  @ApiServiceUnavailableResponse({ description: 'The routing provider is unreachable' })
  plan(@Query() query: PlanRouteQueryDto): Promise<RouteResponseDto> {
    return this.routesService.plan(query);
  }
}
