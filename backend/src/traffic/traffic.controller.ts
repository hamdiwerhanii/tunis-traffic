import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TileParamsDto } from './dto/tile-params.dto.js';
import { TrafficStatusDto } from './dto/traffic-status.dto.js';
import { TrafficService } from './traffic.service.js';

@ApiTags('traffic')
@Controller('traffic')
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get('status')
  @ApiOperation({ summary: 'Tell the map whether live traffic tiles are available' })
  status(): TrafficStatusDto {
    return { liveTraffic: this.trafficService.liveTraffic };
  }

  @Get('tiles/:layer/:z/:x/:y')
  @Throttle({ default: { limit: 900, ttl: 60_000 } })
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=60')
  @ApiProduces('image/png')
  @ApiOperation({ summary: 'Live traffic map tile for Tunisia (TomTom key stays on the server)' })
  @ApiNotFoundResponse({ description: 'Live traffic not configured or tile outside Tunisia' })
  async tile(@Param() params: TileParamsDto): Promise<StreamableFile> {
    return new StreamableFile(await this.trafficService.tile(params));
  }
}
