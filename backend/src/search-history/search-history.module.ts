import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchHistoryController } from './search-history.controller.js';
import { SearchHistoryService } from './search-history.service.js';
import {
    SearchHistory,
    SearchHistorySchema,
} from './schema/search-history.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SearchHistory.name, schema: SearchHistorySchema },
        ]),
    ],
    controllers: [SearchHistoryController],
    providers: [SearchHistoryService],
    exports: [SearchHistoryService],
})
export class SearchHistoryModule { }
