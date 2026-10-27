import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import mongoose, { type Connection } from 'mongoose';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Check that the API and the database are up' })
  @ApiServiceUnavailableResponse({ description: 'The database is not connected' })
  check(): { status: 'ok' } {
    if (this.connection.readyState !== mongoose.ConnectionStates.connected) {
      throw new ServiceUnavailableException('Database is not connected');
    }
    return { status: 'ok' };
  }
}
