import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'search_history', versionKey: false })
export class SearchEntry {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  query: string;

  @Prop({ trim: true, maxlength: 300 })
  placeName?: string;

  @Prop({ required: true, min: -90, max: 90 })
  lat: number;

  @Prop({ required: true, min: -180, max: 180 })
  lng: number;

  @Prop({ required: true, default: () => new Date() })
  searchedAt: Date;
}

export type SearchEntryDocument = HydratedDocument<SearchEntry>;

export const SearchEntrySchema = SchemaFactory.createForClass(SearchEntry);
SearchEntrySchema.index({ sessionId: 1, lat: 1, lng: 1 }, { unique: true });
SearchEntrySchema.index({ sessionId: 1, searchedAt: -1 });
