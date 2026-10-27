import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isDuplicateKeyError } from '../common/database/mongo-errors.js';
import { roundCoordinate } from '../common/geo/tunisia.js';
import { MAX_HISTORY } from './dto/list-history.query.dto.js';
import { RecordSearchDto } from './dto/record-search.dto.js';
import { SearchEntryResponseDto, toSearchEntryResponse } from './dto/search-entry-response.dto.js';
import { SearchEntry } from './search-entry.schema.js';

const HISTORY_PRECISION = 5;

@Injectable()
export class SearchHistoryService {
  constructor(@InjectModel(SearchEntry.name) private readonly entries: Model<SearchEntry>) {}

  async list(sessionId: string, limit: number): Promise<SearchEntryResponseDto[]> {
    const entries = await this.entries
      .find({ sessionId })
      .sort({ searchedAt: -1 })
      .limit(limit)
      .lean();
    return entries.map(toSearchEntryResponse);
  }

  async record(sessionId: string, dto: RecordSearchDto): Promise<SearchEntryResponseDto> {
    const filter = {
      sessionId,
      lat: roundCoordinate(dto.lat, HISTORY_PRECISION),
      lng: roundCoordinate(dto.lng, HISTORY_PRECISION),
    };
    const update = {
      $set: { query: dto.query, placeName: dto.placeName || undefined, searchedAt: new Date() },
    };

    const entry = await this.upsert(filter, update);
    await this.trim(sessionId);
    return toSearchEntryResponse(entry);
  }

  async clear(sessionId: string): Promise<void> {
    await this.entries.deleteMany({ sessionId });
  }

  private async upsert(
    filter: Pick<SearchEntry, 'sessionId' | 'lat' | 'lng'>,
    update: object,
    retry = true,
  ): Promise<SearchEntry & { _id: unknown }> {
    try {
      return await this.entries
        .findOneAndUpdate(filter, update, { upsert: true, returnDocument: 'after' })
        .lean()
        .orFail();
    } catch (error) {
      if (retry && isDuplicateKeyError(error)) return this.upsert(filter, update, false);
      throw error;
    }
  }

  private async trim(sessionId: string): Promise<void> {
    const overflow = await this.entries
      .find({ sessionId })
      .sort({ searchedAt: -1 })
      .skip(MAX_HISTORY)
      .select('_id')
      .lean();

    if (overflow.length > 0) {
      await this.entries.deleteMany({ _id: { $in: overflow.map((entry) => entry._id) } });
    }
  }
}
