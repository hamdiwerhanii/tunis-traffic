import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller.js';
import { PlacesService } from './places.service.js';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
