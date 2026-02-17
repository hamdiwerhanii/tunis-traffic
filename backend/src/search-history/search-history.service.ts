import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchHistory } from './schema/search-history.schema.js';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto.js';

@Injectable()
export class SearchHistoryService {
    constructor(
        @InjectModel(SearchHistory.name)
        private searchHistoryModel: Model<SearchHistory>,
    ) { }

    private readonly logger = new Logger(SearchHistoryService.name);

    async create(
        createSearchHistoryDto: CreateSearchHistoryDto,
    ): Promise<SearchHistory> {
        try {
            const entry = new this.searchHistoryModel(createSearchHistoryDto);
            const saved = await entry.save();

            // Keep only last 20 entries per session (auto-cleanup)
            const count = await this.searchHistoryModel
                .countDocuments({ sessionId: createSearchHistoryDto.sessionId })
                .exec();

            if (count > 20) {
                const oldest = await this.searchHistoryModel
                    .find({ sessionId: createSearchHistoryDto.sessionId })
                    .sort({ createdAt: 1 })
                    .limit(count - 20)
                    .select('_id')
                    .exec();

                await this.searchHistoryModel
                    .deleteMany({ _id: { $in: oldest.map((o) => o._id) } })
                    .exec();
            }

            return saved;
        } catch (error) {
            this.logger.error(`Failed to create search history: ${error}`);
            throw error;
        }
    }

    async findBySession(
        sessionId: string,
        limit: number = 10,
    ): Promise<SearchHistory[]> {
        try {
            return this.searchHistoryModel
                .find({ sessionId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean()
                .exec();
        } catch (error) {
            this.logger.error(`Failed to find search history: ${error}`);
            throw error;
        }
    }

    async clearBySession(sessionId: string): Promise<{ deletedCount: number }> {
        try {
            const result = await this.searchHistoryModel
                .deleteMany({ sessionId })
                .exec();

            return { deletedCount: result.deletedCount };
        } catch (error) {
            this.logger.error(`Failed to clear search history: ${error}`);
            throw error;
        }
    }
}
