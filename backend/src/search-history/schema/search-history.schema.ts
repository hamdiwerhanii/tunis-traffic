import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchHistoryDocument = SearchHistory & Document;

@Schema({ timestamps: true })
export class SearchHistory {
    @Prop({ required: true })
    query: string;

    @Prop({ required: false })
    placeName: string;

    @Prop({ required: true })
    lat: number;

    @Prop({ required: true })
    lng: number;

    @Prop({ required: true, index: true })
    sessionId: string;

    _id: string;
    createdAt: Date;
}

export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);
