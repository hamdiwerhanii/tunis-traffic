import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchEntry, SearchEntrySchema } from './search-entry.schema.js';
import { SearchHistoryController } from './search-history.controller.js';
import { SearchHistoryService } from './search-history.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: SearchEntry.name, schema: SearchEntrySchema }])],
  controllers: [SearchHistoryController],
  providers: [SearchHistoryService],
})
export class SearchHistoryModule {}
